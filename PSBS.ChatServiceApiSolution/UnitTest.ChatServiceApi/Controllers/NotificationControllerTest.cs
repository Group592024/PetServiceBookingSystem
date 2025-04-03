using FakeItEasy;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ChatServiceApi.Application.DTOs;
using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Presentation.Controllers;
using FluentAssertions;
using PSPS.SharedLibrary.Responses;
using Xunit;
using ChatServiceApi.Domain.Entities;

namespace UnitTest.ChatServiceApi.Controllers
{
    public class NotificationControllerTest
    {
        private readonly INoticationRepository _notificationRepository;
        private readonly INotificationMessagePublisher _notificationMessagePublisher;
        private readonly NotificationController _notificationController;

        public NotificationControllerTest()
        {
            _notificationRepository = A.Fake<INoticationRepository>();
            _notificationMessagePublisher = A.Fake<INotificationMessagePublisher>();
            _notificationController = new NotificationController(_notificationRepository, _notificationMessagePublisher);
        }

        // CREATE NOTIFICATION TESTS
        [Fact]
        public async Task CreateNotification_ValidModel_ReturnsOkWithResponse()
        {
            // Arrange
            var createNotificationDto = new CreateNotificationDTO(Guid.NewGuid(), "Test Title", "Test Content");         

            var expectedResponse = new Response(true, "Notification created successfully");
            A.CallTo(() => _notificationRepository.CreateNotification(A<Notification>._)).Returns(expectedResponse);
            _notificationController.ModelState.Clear();

            // Act
            var result = await _notificationController.CreateNotification(createNotificationDto);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response.Should().BeEquivalentTo(expectedResponse);
        }

        [Fact]
        public async Task CreateNotification_InvalidModel_ReturnsBadRequest()
        {
            // Arrange
            var createNotificationDto = new CreateNotificationDTO(Guid.NewGuid(), "", "Test Content");

            _notificationController.ModelState.AddModelError("NotificationTitle", "Title is required");
            _notificationController.ModelState.AddModelError("NotificationContent", "Content is required");
            _notificationController.ModelState.AddModelError("Receivers", "Receivers are required");

            // Act
            var result = await _notificationController.CreateNotification(createNotificationDto);

            // Assert
            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        }

      

        // PUSH NOTIFICATION TESTS
        [Fact]
        public async Task PushNotification_ValidModel_EmailNotification_ReturnsOk()
        {
            // Arrange
            var pushNotificationDto = new PushNotificationDTO(Guid.NewGuid(), new List<ReceiverDTO>(), true);
           

            var notification = new Notification { NotificationId = pushNotificationDto.notificationId };
            var expectedResponse = new Response(true, "Notification pushed successfully");

            A.CallTo(() => _notificationRepository.GetNotificationById(pushNotificationDto.notificationId)).Returns(notification);
            A.CallTo(() => _notificationMessagePublisher.SendEmailNotificationMessageAsync(A<SendNotificationDTO>._)).Returns(expectedResponse);
            A.CallTo(() => _notificationRepository.PushNotificationUsers(pushNotificationDto.notificationId)).Returns(expectedResponse);

            // Act
            var result = await _notificationController.PushNotification(pushNotificationDto);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task PushNotification_ValidModel_PushNotification_ReturnsOk()
        {
            // Arrange
            var pushNotificationDto = new PushNotificationDTO(Guid.NewGuid(), new List<ReceiverDTO>(), false);
            var expectedResponse = new Response(true, "Notification pushed successfully");

            A.CallTo(() => _notificationMessagePublisher.BatchingPushNotificationAsync(pushNotificationDto)).Returns(expectedResponse);
            A.CallTo(() => _notificationRepository.PushNotificationUsers(pushNotificationDto.notificationId)).Returns(expectedResponse);

            // Act
            var result = await _notificationController.PushNotification(pushNotificationDto);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task PushNotification_InvalidModel_ReturnsBadRequest()
        {
            // Arrange
            var pushNotificationDto = new PushNotificationDTO(Guid.NewGuid(), null, true);

            _notificationController.ModelState.AddModelError("notificationId", "Invalid ID");
            _notificationController.ModelState.AddModelError("Receivers", "Receivers are required");

            // Act
            var result = await _notificationController.PushNotification(pushNotificationDto);

            // Assert
            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        }

        [Fact]
        public async Task PushNotification_EmailNotificationNotFound_ReturnsNotFound()
        {
            // Arrange
            var pushNotificationDto = new PushNotificationDTO(Guid.NewGuid(), new List<ReceiverDTO>(), true);

            A.CallTo(() => _notificationRepository.GetNotificationById(pushNotificationDto.notificationId)).Returns(Task.FromResult<Notification>(null));

            // Act
            var result = await _notificationController.PushNotification(pushNotificationDto);

            // Assert
            var notFoundResult = result as NotFoundResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult!.StatusCode.Should().Be(StatusCodes.Status404NotFound);
        }

        // UPDATE NOTIFICATION TESTS
        [Fact]
        public async Task UpdateNotification_ValidModel_ReturnsOk()
        {
            // Arrange
            var updateNotificationDto = new UpdateNotificationDTO(Guid.NewGuid(), Guid.NewGuid(), "Updated Title", "Updated Content", false);
         

            var expectedResponse = new Response(true, "Notification updated successfully");
            A.CallTo(() => _notificationRepository.UpdateNotification(A<Notification>._)).Returns(expectedResponse);
            _notificationController.ModelState.Clear();

            // Act
            var result = await _notificationController.UpdateNotification(updateNotificationDto);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        // DELETE TESTS
        [Fact]
        public async Task DeleteUserNotification_ValidId_ReturnsOk()
        {
            // Arrange
            var notificationBoxId = Guid.NewGuid();
            var expectedResponse = new Response(true, "Notification deleted successfully");
            A.CallTo(() => _notificationRepository.DetelteNotification(notificationBoxId)).Returns(expectedResponse);

            // Act
            var result = await _notificationController.DeleteUserNotification(notificationBoxId);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        [Fact]
        public async Task DeleteNotification_ValidId_ReturnsOk()
        {
            // Arrange
            var notificationBoxId = Guid.NewGuid();
            var expectedResponse = new Response(true, "User notification deleted successfully");
            A.CallTo(() => _notificationRepository.DetelteUserNotification(notificationBoxId)).Returns(expectedResponse);

            // Act
            var result = await _notificationController.DeleteNotification(notificationBoxId);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        // SET IS READ TESTS
        [Fact]
        public async Task SetIsReadNotification_ValidId_ReturnsOk()
        {
            // Arrange
            var notificationBoxId = Guid.NewGuid();
            var expectedResponse = new Response(true, "Notification marked as read");
            A.CallTo(() => _notificationRepository.SetNotificationIsRead(notificationBoxId)).Returns(expectedResponse);

            // Act
            var result = await _notificationController.SetIsReadNotification(notificationBoxId);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        }

        // GET NOTIFICATIONS TESTS
        [Fact]
        public async Task GetNotifications_WhenNotificationsExist_ReturnsOkWithData()
        {
            // Arrange
            var notifications = new List<Notification>
    {
        new Notification
        {
            NotificationId = Guid.NewGuid(),
            NotificationTitle = "Test 1",
            NotificationContent = "Content 1",
            CreatedDate = DateTime.Now,
            IsDeleted = false,
            IsPushed = true,
            NotificationType = new NotificationType  // Add this required property
            {
                NotiName = "Type1"
            }
        },
        new Notification
        {
            NotificationId = Guid.NewGuid(),
            NotificationTitle = "Test 2",
            NotificationContent = "Content 2",
            CreatedDate = DateTime.Now,
            IsDeleted = false,
            IsPushed = true,
            NotificationType = new NotificationType  // Add this required property
            {
                NotiName = "Type2"
            }
        }
    };

            A.CallTo(() => _notificationRepository.GetNotifications()).Returns(notifications);

            // Act
            var result = await _notificationController.GetNotifications();

            // Assert
            result.Should().NotBeNull();
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Be("the notifications is retrieved successfully");
            response.Data.Should().NotBeNull()
                .And.BeAssignableTo<IEnumerable<NotificationDTO>>();
        }

        [Fact]
        public async Task GetNotifications_WhenNoNotifications_ReturnsOkWithEmptyMessage()
        {
            // Arrange
            A.CallTo(() => _notificationRepository.GetNotifications()).Returns(new List<Notification>());

            // Act
            var result = await _notificationController.GetNotifications();

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();     
        }

        // GET NOTIFICATIONS BY USER ID TESTS
        [Fact]
        public async Task GetNotificationsByUserId_WhenNotificationsExist_ReturnsOkWithData()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var notifications = new List<NotificationBox>
    {
        new NotificationBox
        {
            NotiBoxId = Guid.NewGuid(),
            UserId = userId,
            CreatedDate = DateTime.Now,
            IsDeleted = false,
            IsRead = false,
            Notification = new Notification  // Add required navigation property
            {
                NotificationId = Guid.NewGuid(),
                NotificationTitle = "Test Title",
                NotificationContent = "Test Content",
                NotificationType = new NotificationType  // Add required nested property
                {
                    NotiName = "TestType"
                }
            }
        }
    };

            A.CallTo(() => _notificationRepository.GetNotificationsByUserIdAsync(userId)).Returns(notifications);

            // Act
            var result = await _notificationController.GetNotificationsByUserId(userId);

            // Assert
            result.Should().NotBeNull();
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Be("the notifications is retrieved successfully");
            response.Data.Should().NotBeNull()
                .And.BeAssignableTo<IEnumerable<UserNotificationDTO>>();
        }

        [Fact]
        public async Task GetNotificationsByUserId_WhenNoNotifications_ReturnsOkWithEmptyMessage()
        {
            // Arrange
            var userId = Guid.NewGuid();
            A.CallTo(() => _notificationRepository.GetNotificationsByUserIdAsync(userId)).Returns(new List<NotificationBox>());

            // Act
            var result = await _notificationController.GetNotificationsByUserId(userId);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var response = okResult.Value as Response;
            response.Should().NotBeNull();
            response!.Flag.Should().BeTrue();
         
        }
    }
}