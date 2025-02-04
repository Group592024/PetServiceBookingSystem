import * as signalR from "@microsoft/signalr";

class SignalRService {
  connection = null;
  isConnected = false;
  retryCount = 0;
  MAX_RETRIES = 5;
  hubUrl = null;
  reconnecting = false;

  setHubUrl(hubUrl) {
    this.hubUrl = hubUrl;
  }

  async startConnection(hubUrl) {
    if (!hubUrl) return;

    if (this.isConnected || this.reconnecting) return;

    this.reconnecting = true;

    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          return retryContext.retryCount < 3 ? 1000 : 5000;
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      this.isConnected = this.connection.state === signalR.HubConnectionState.Connected;
      this.reconnecting = false;
      this.retryCount = 0;
      console.log("✅ SignalR Connected.");
    } catch (error) {
      console.error("❌ SignalR Connection Error:", error);
      this.reconnecting = false;
      this.retryCount++;
      if (this.retryCount < this.MAX_RETRIES) {
        setTimeout(() => this.startConnection(hubUrl), 5000);
      } else {
        console.error("Max retries reached. Giving up.");
      }
    }

    this.connection.onclose(() => {
      console.warn("⚠️ SignalR Disconnected.");
      this.isConnected = false;
      this.retryCount = 0;
      if (!this.reconnecting) {
        this.startConnection(hubUrl);
      }
    });
  }

  async invoke(methodName, ...args) {
    if (!this.isConnected) {
      console.warn("SignalR is not connected. Queuing invocation.");
      return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
          if (this.isConnected) {
            clearInterval(intervalId);
            this.connection.invoke(methodName, ...args)
              .then(resolve)
              .catch(reject);
          }
        }, 500);
        setTimeout(() => {
          clearInterval(intervalId);
          reject("SignalR connection timed out.");
        }, 10000);
      });
    }

    try {
      return await this.connection.invoke(methodName, ...args);
    } catch (error) {
      console.error(`❌ Error invoking ${methodName}:`, error);
      return Promise.reject(`Error invoking ${methodName}: ${error}`);
    }
  }

  on(methodName, callback) {
    if (this.connection) {
      this.connection.off(methodName);
      this.connection.on(methodName, callback);
    }
  }

  off(methodName) {
    if (this.connection) {
      this.connection.off(methodName);
    }
  }
}

const signalRService = new SignalRService();
export default signalRService;
