using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Presentation.Hubs;
using FakeItEasy;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;


namespace UnitTest.ChatServiceApi.Hubs
{
    public class ChatHubTestBase : IDisposable
    {
        protected readonly IChatService _chatService;
        protected readonly TestableChatHub _hub;
        protected readonly IClientProxy _clientProxy;
        protected readonly ISingleClientProxy _singleClientProxy;
        protected readonly IGroupManager _groups;

        public ChatHubTestBase()
        {
            _chatService = A.Fake<IChatService>();
            _clientProxy = A.Fake<IClientProxy>();
            _singleClientProxy = A.Fake<ISingleClientProxy>();
            _groups = A.Fake<IGroupManager>();

            _hub = new TestableChatHub(_chatService)
            {
                Clients = A.Fake<IHubCallerClients>(),
                Context = A.Fake<HubCallerContext>(),
                Groups = _groups
            };

            // Setup default client mocks for different SignalR versions
            A.CallTo(() => _hub.Clients.Caller).Returns(_singleClientProxy);
            A.CallTo(() => _hub.Clients.Group(A<string>._)).Returns(_clientProxy);
            A.CallTo(() => _hub.Clients.Client(A<string>._)).Returns(_singleClientProxy);
            A.CallTo(() => _hub.Clients.All).Returns(_clientProxy);
        }

        public void Dispose()
        {
            // Clear static connections between tests
            _hub.ClearConnections();
        }

        protected class TestableChatHub : ChatHub
        {
            public TestableChatHub(IChatService chatService) : base(chatService) { }

            public ConcurrentDictionary<string, string> Connections => _connections;

            public void ClearConnections()
            {
                _connections.Clear();
            }

            public void SetConnectionId(string connectionId)
            {
                A.CallTo(() => Context.ConnectionId).Returns(connectionId);
            }

            public void SetHttpContext(HttpContext httpContext)
            {
                Context.Items["HttpContext"] = httpContext;
            }
        }
    }
}
