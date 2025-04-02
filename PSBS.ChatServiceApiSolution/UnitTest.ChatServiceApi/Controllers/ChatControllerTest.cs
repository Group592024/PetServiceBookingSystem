

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

            // Set up file properties to pass validation
            A.CallTo(() => mockFile.ContentType).Returns("image/jpeg"); // Must be an image type
            A.CallTo(() => mockFile.FileName).Returns("test.jpg");      // Should have image extension
            A.CallTo(() => mockFile.Length).Returns(1024);             // Should have non-zero size

            var repositoryResponse = new Response(true, "Image uploaded successfully.")
            {
                Data = "/uploads/test.jpg"
            };

            A.CallTo(() => chatInterface.StoreImage(mockFile, A<string>.Ignored))
             .Returns(Task.FromResult(repositoryResponse));

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
            var repositoryResponse = new Response(false, "Invalid file type. Only image files are allowed.");
            A.CallTo(() => chatInterface.StoreImage(mockFile, A<string>.Ignored)).Returns(Task.FromResult(repositoryResponse));
            A.CallTo(() => webHostEnvironment.WebRootPath).Returns("somePath");

            // Act
            var result = await chatControllers.UploadImage(mockFile);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<Response>(badRequestResult.Value);
            Assert.False(response.Flag);
            Assert.Equal("Invalid file type. Only image files are allowed.", response.Message);
        }

        [Fact]
        public async Task UploadImage_CallsRepositoryWithCorrectParameters()
        {
            // Arrange
            var mockFile = A.Fake<IFormFile>();
            A.CallTo(() => mockFile.ContentType).Returns("image/jpeg"); // Ensure this is an image type
            A.CallTo(() => mockFile.FileName).Returns("test.jpg");
            A.CallTo(() => webHostEnvironment.WebRootPath).Returns("somePath");
            var repositoryResponse = new Response(true, "Image uploaded successfully.") { Data = "/uploads/test.jpg" };
            A.CallTo(() => chatInterface.StoreImage(mockFile, A<string>.Ignored)).Returns(Task.FromResult(repositoryResponse));

            // Act
            await chatControllers.UploadImage(mockFile);

            // Assert
            A.CallTo(() => chatInterface.StoreImage(mockFile, "somePath")).MustHaveHappenedOnceExactly();
        }


        [Fact]
        public async Task UploadImage_ReturnsBadRequest_WhenFileIsNotImageType()
        {
            // Arrange
            var mockFile = A.Fake<IFormFile>();
            A.CallTo(() => mockFile.ContentType).Returns("application/pdf");
            A.CallTo(() => mockFile.FileName).Returns("test.pdf");
            A.CallTo(() => webHostEnvironment.WebRootPath).Returns("somePath");

            // Act
            var result = await chatControllers.UploadImage(mockFile);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<Response>(badRequestResult.Value);
            Assert.False(response.Flag);
            Assert.Equal("Invalid file type. Only image files are allowed.", response.Message);

            // Verify repository was never called
            A.CallTo(() => chatInterface.StoreImage(A<IFormFile>._, A<string>._)).MustNotHaveHappened();
        }
    }
}
