import * as signalR from "@microsoft/signalr";

class SignalRService {
  connection = null;
  isConnected = false;
  retryCount = 0;
  MAX_RETRIES = 5;
  hubUrl = null; // Store the hubUrl as a class property

  async startConnection(hubUrl) {
    this.hubUrl = hubUrl; // Set the hubUrl when starting the connection

    if (
      this.connection?.state === signalR.HubConnectionState.Connected ||
      this.connection?.state === signalR.HubConnectionState.Connecting
    ) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      this.isConnected = true;
      this.retryCount = 0; // Reset retry count on successful connection
      console.log("✅ SignalR Connected.");
    } catch (error) {
      console.error("❌ SignalR Connection Error:", error);
      this.retryCount++;
      if (this.retryCount < this.MAX_RETRIES) {
        setTimeout(() => this.startConnection(hubUrl), 5000);
      } else {
        console.error("Max retries reached. Giving up.");
      }
    }

    this.connection.onclose(() => {
      console.warn("⚠️ SignalR Disconnected. Reconnecting...");
      this.isConnected = false;
      this.startConnection(hubUrl);
    });
  }

  async invoke(methodName, ...args) {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      console.error("SignalR is not connected yet. Retrying...");
      await this.startConnection(this.hubUrl); // Use the stored hubUrl
      return this.invoke(methodName, ...args); // Retry the invocation
    }

    try {
      await this.connection.invoke(methodName, ...args);
      return true;
    } catch (error) {
      console.error(`❌ Error invoking ${methodName}:`, error);
      return false;
    }
  }

  on(methodName, callback) {
    if (this.connection) {
      this.connection.off(methodName); // Remove previous listener
      this.connection.on(methodName, callback);
    }
  }

  off(methodName) {
    if (this.connection) {
      this.connection.off(methodName);
    }
  }
}

// Export a singleton instance of SignalRService
export default new SignalRService();