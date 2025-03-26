

using ChatServiceApi.Application.DTOs;
using ChatServiceApi.Application.Interfaces;
using Newtonsoft.Json;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using RabbitMQ.Client;
using System.Text;

namespace ChatServiceApi.Infrastructure.RabbitMessaging
{
    public class RabbitMQMessagePublisher : INotificationMessagePublisher
    {

        public async Task<Response> BatchingPushNotificationAsync(PushNotificationDTO pushNotification)
        {
            LogExceptions.LogToConsole("da vo trong day r");
            var factory = new ConnectionFactory
            {
                Uri = new Uri("amqp://guest:guest@localhost:5672"),
                ClientProvidedName = "Rabbit Sender App"
            };

            try
            {
                using var connection =  factory.CreateConnection();

                if (!connection.IsOpen)
                {
                    LogExceptions.LogToConsole("da vo trong day r ha ha");
                    return new Response { Flag = false, Message = "Failed to connect to RabbitMQ server." };             
                }

                using var channel =  connection.CreateModel();

                string exchangeName = "NotificationExchange";
                string routingKey = "notification-routing-key";
                string queueName = "notification_queue";

                 channel.ExchangeDeclare(exchangeName, ExchangeType.Direct);
                 channel.QueueDeclare(queueName, false, false, false, null);
                 channel.QueueBind(queueName, exchangeName, routingKey, null);

                int batchSize = 100; // Adjust batch size as needed
                int receiverCount = pushNotification.Receivers.Count;

                for (int i = 0; i < receiverCount; i += batchSize)
                {
                    var batch = pushNotification.Receivers.Skip(i).Take(batchSize).ToList();
                    var batchNotification = new PushNotificationDTO(pushNotification.notificationId, batch);
                    var batchMessageBody = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(batchNotification));

                    channel.BasicPublish(exchange: exchangeName,
                                   routingKey: routingKey,
                                   basicProperties: null,
                                   body: batchMessageBody);
                }

                return new Response { Flag = true, Message = "Messages published in batches successfully." };
            }
            catch (RabbitMQ.Client.Exceptions.BrokerUnreachableException ex)
            {
                Console.WriteLine($" [!] Error: {ex.Message}");
                return new Response { Flag = false, Message = "Failed to publish messages in batches.", Data = ex };
            }
            catch (Exception ex)
            {
                Console.WriteLine($" [!] Error: {ex.Message}");
                return new Response { Flag = false, Message = "Failed to publish messages in batches.", Data = ex };
            }
        }
        public async Task<Response> PublishNotificationMessageAsync(NotificationMessage message)
        {
            var factory = new ConnectionFactory
            {
                Uri = new Uri("amqp://guest:guest@localhost:5672"),
                ClientProvidedName = "Rabbit Sender App"
            };

            try
            {
                using var connection =  factory.CreateConnection();


                if (connection == null)
                {
                    return new Response { Flag = false, Message = "Failed to connect to RabbitMQ server." };
                }

                using var channel =  connection.CreateModel();


                string exchangeName = "NotificationExchange";
                string routingKey = "notification-routing-key";
                string queueName = "notification_queue";


                // Declare the exchange and queue, and bind them
                channel.ExchangeDeclare(exchangeName, ExchangeType.Direct);
                channel.QueueDeclare(queueName, false, false, false, null);
                channel.QueueBind(queueName, exchangeName, routingKey, null);


                // convert the message to JSON

                var messageBody = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(message));

                // Pushlis the message to the queu

                channel.BasicPublish(exchange: exchangeName,
                                     routingKey: routingKey,
                                     basicProperties: null,
                                     body: messageBody);
                return new Response { Flag = true, Message = "Message published successfully." };
            }
            catch (RabbitMQ.Client.Exceptions.BrokerUnreachableException  ex) {
                // Handle exceptions and return an error response
                Console.WriteLine($" [!] Error: {ex.Message}");
                return new Response { Flag = false, Message = "Failed to publish message.", Data = ex };
            }
        }
    }
}
