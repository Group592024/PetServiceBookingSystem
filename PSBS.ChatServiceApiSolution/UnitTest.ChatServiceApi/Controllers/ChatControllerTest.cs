

using ChatServiceApi.Application.Interfaces;
using ChatServiceApi.Presentation.Controllers;
using FakeItEasy;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.Responses;

namespace UnitTest.ChatServiceApi.Controllers
{
    public class ChatControllerTest
    {
        private readonly IChatRepository chatInterface;
        private readonly ChatControllers chatControllers;
        private readonly IWebHostEnvironment webHostEnvironment;
        public ChatControllerTest()
        {
            // set up dependecies
            chatInterface = A.Fake<IChatRepository>();
            webHostEnvironment = A.Fake<IWebHostEnvironment>();
            // set up System Under Test 
            chatControllers = new ChatControllers(chatInterface, webHostEnvironment);
          
        }

        [Fact]
        public async Task UploadImage_ReturnsOkWithImageUrl_WhenRepositorySucceeds()
        {
            // Arrange
            var mockFile = A.Fake<IFormFile>();
            var repositoryResponse = new Response(true, "Image uploaded successfully.") { Data = "/uploads/test.jpg" };
            A.CallTo(() => chatInterface.StoreImage(mockFile, A<string>.Ignored)).Returns(Task.FromResult(repositoryResponse));
            A.CallTo(() => webHostEnvironment.WebRootPath).Returns("somePath");

            // Act
            var result = await chatControllers.UploadImage(mockFile);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<Response>(okResult.Value);
            Assert.True(response.Flag);
            Assert.Equal("/uploads/test.jpg", response.Data);
        }

        [Fact]
        public async Task UploadImage_ReturnsBadRequest_WhenRepositoryFails()
        {
            // Arrange
            var mockFile = A.Fake<IFormFile>();
            var repositoryResponse = new Response(false, "Upload failed.");
            A.CallTo(() => chatInterface.StoreImage(mockFile, A<string>.Ignored)).Returns(Task.FromResult(repositoryResponse));
            A.CallTo(() => webHostEnvironment.WebRootPath).Returns("somePath");

            // Act
            var result = await chatControllers.UploadImage(mockFile);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<Response>(badRequestResult.Value);
            Assert.False(response.Flag);
            Assert.Equal("Upload failed.", response.Message);
        }

        [Fact]
        public async Task UploadImage_CallsRepositoryWithCorrectParameters()
        {
            // Arrange
            var mockFile = A.Fake<IFormFile>();
            A.CallTo(() => webHostEnvironment.WebRootPath).Returns("somePath");
            var repositoryResponse = new Response(true, "Image uploaded successfully.") { Data = "/uploads/test.jpg" };
            A.CallTo(() => chatInterface.StoreImage(mockFile, A<string>.Ignored)).Returns(Task.FromResult(repositoryResponse));

            // Act
            await chatControllers.UploadImage(mockFile);

            // Assert
            A.CallTo(() => chatInterface.StoreImage(mockFile, "somePath")).MustHaveHappenedOnceExactly();
        }
    }
}
