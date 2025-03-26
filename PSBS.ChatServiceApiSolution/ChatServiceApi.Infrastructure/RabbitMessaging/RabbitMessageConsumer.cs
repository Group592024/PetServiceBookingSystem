
using ChatServiceApi.Application.DTOs;
using ChatServiceApi.Application.Interfaces;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Threading.Channels;

namespace ChatServiceApi.Infrastructure.RabbitMessaging
{
    public class RabbitMessageConsumer
    {
        private readonly IConnection _connection;
        private readonly RabbitMQ.Client.IModel _channel;
        private readonly INoticationRepository _notificationRepository;

        public RabbitMessageConsumer(INoticationRepository noticationRepository)
        {
            var factory = new ConnectionFactory
            {
                Uri = new Uri("amqp://guest:guest@localhost:5672"),
                ClientProvidedName = "Rabbit Receive App"
            };
            _notificationRepository = noticationRepository;
            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

            string exchangeName = "NotificationExchange";
            string routingKey = "notification-routing-key";
            string queueName = "notification_queue";

            _channel.ExchangeDeclare(exchangeName, ExchangeType.Direct);
            _channel.QueueDeclare(queueName, false, false, false, null);
            _channel.QueueBind(queueName, exchangeName, routingKey, null);
            _channel.BasicQos(0, 1, false);
       
        }

        public async Task<Response> PushedNotificationConsumer()
        {
        
            var consumer = new EventingBasicConsumer(_channel);

            consumer.Received += async (sender, args) => // Add async here
            {
                try
                {
                    var body = args.Body.ToArray();
                    string message = Encoding.UTF8.GetString(body);
                    LogExceptions.LogToDebugger("New message received: " + message);
                    var result = await ProcessMessage(message); // Await the ProcessMessage
                                                                // Await the Ack
                    if (result.Flag)
                    {
                         _channel.BasicAck(args.DeliveryTag, false);
                    }
                    else
                    {
                         _channel.BasicNack(args.DeliveryTag, false, true);
                    }
                }
                catch (Exception ex)
                {
                    LogExceptions.LogToDebugger($"Error processing message: {ex.Message}");
                    // Decide if you want to requeue or not.
                    _channel.BasicNack(args.DeliveryTag, false, true); // example of Nack.
                }
            };

             _channel.BasicConsume(queue: "notification_queue",
                                     autoAck: false,
                                     consumer: consumer);

            return new Response { Flag = true, Message = "The message consumer is running." }; // change flag to true since consumer is running.
        }
         
    


        private async Task<Response> ProcessMessage(string message)
        {
            try
            {
                PushNotificationDTO pushNotification = JsonConvert.DeserializeObject<PushNotificationDTO>(message);

                if (pushNotification != null)
                {
                    foreach (var receiver in pushNotification.Receivers)
                    {
                        try
                        {
                            // Process each receiver
                            var result = await _notificationRepository.PushSingleNotification(pushNotification.notificationId, receiver.UserId);

                            if (!result.Flag)
                            {
                                LogExceptions.LogToDebugger($"Error processing receiver: {receiver.UserId}");
                                return new Response { Flag = false, Message = $"Error processing receiver: {receiver.UserId}" };
                            }
                        }
                        catch (Exception ex)
                        {
                            LogExceptions.LogToDebugger($"Error processing receiver: {ex.Message}");
                            return new Response { Flag = false, Message = $"Error processing receiver: {ex.Message}" };
                        }
                    }
                    return new Response { Flag = true, Message = "All receivers processed successfully." };
                }
                else
                {
                    LogExceptions.LogToDebugger("Failed to deserialize message to PushNotificationDTO.");
                    return new Response { Flag = false, Message = "Failed to deserialize message to PushNotificationDTO." };
                }
            }
            catch (JsonException ex)
            {
                LogExceptions.LogToDebugger($"Error deserializing JSON: {ex.Message}");
                return new Response { Flag = false, Message = "Failed to deserialize message to PushNotificationDTO." };
            }
            catch (Exception ex)
            {
                LogExceptions.LogToDebugger($"Error processing message: {ex.Message}");
                return new Response { Flag = false, Message = $"Error processing message: {ex.Message}" };
            }
        }
    }
}