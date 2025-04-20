using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.DTOs.Conversions;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using FacilityServiceApi.Presentation.Controllers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FakeItEasy;
using PSPS.SharedLibrary.Responses;
using Xunit;

namespace UnitTest.FacilityServiceApi.Controllers
{
    public class BookingServiceItemsControllerTest
    {
        private readonly IBookingServiceItem _bookingServiceItemInterface;
        private readonly FacilityServiceDbContext _context;
        private readonly BookingServiceItemsController _controller;

        public BookingServiceItemsControllerTest()
        {
            var options = new DbContextOptionsBuilder<FacilityServiceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new FacilityServiceDbContext(options);
            _bookingServiceItemInterface = A.Fake<IBookingServiceItem>();
            _controller = new BookingServiceItemsController(_context, _bookingServiceItemInterface);
        }

        [Fact]
        public async Task GetBookingItemByBookingId_WithExistingItems_ReturnsOkResult()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            var bookingItems = new List<BookingServiceItem>
            {
                new BookingServiceItem
                {
                    BookingServiceItemId = Guid.NewGuid(),
                    BookingId = bookingId,
                    ServiceVariantId = Guid.NewGuid(),
                    PetId = Guid.NewGuid(),
                    Price = 100.00m,
                    CreateAt = DateTime.Now,
                    UpdateAt = DateTime.Now
                },
                new BookingServiceItem
                {
                    BookingServiceItemId = Guid.NewGuid(),
                    BookingId = bookingId,
                    ServiceVariantId = Guid.NewGuid(),
                    PetId = Guid.NewGuid(),
                    Price = 150.00m,
                    CreateAt = DateTime.Now,
                    UpdateAt = DateTime.Now
                }
            };

            await _context.bookingServiceItems.AddRangeAsync(bookingItems);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetBookingItemByBookingId(bookingId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Booking item retrieved successfully!");
            var returnedItems = response.Data.Should().BeAssignableTo<List<BookingServiceItem>>().Subject;
            returnedItems.Should().HaveCount(2);
            returnedItems.Should().AllSatisfy(item => item.BookingId.Should().Be(bookingId));
        }

        [Fact]
        public async Task GetBookingItemByBookingId_WithNoItems_ReturnsNotFound()
        {
            // Arrange
            var bookingId = Guid.NewGuid();

            // Act
            var result = await _controller.GetBookingItemByBookingId(bookingId);

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
            response.Message.Should().Be("No item detected");
        }

        [Fact]
        public async Task GetBookingItemById_WithExistingItem_ReturnsOkResult()
        {
            // Arrange
            var bookingServiceItemId = Guid.NewGuid();
            var bookingItem = new BookingServiceItem
            {
                BookingServiceItemId = bookingServiceItemId,
                BookingId = Guid.NewGuid(),
                ServiceVariantId = Guid.NewGuid(),
                PetId = Guid.NewGuid(),
                Price = 100.00m,
                CreateAt = DateTime.Now,
                UpdateAt = DateTime.Now
            };

            await _context.bookingServiceItems.AddAsync(bookingItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetBookingItemById(bookingServiceItemId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Booking item retrieved successfully!");
            var returnedItem = response.Data.Should().BeOfType<BookingServiceItem>().Subject;
            returnedItem.BookingServiceItemId.Should().Be(bookingServiceItemId);
        }

        [Fact]
        public async Task GetBookingItemById_WithNonExistingItem_ReturnsNotFound()
        {
            // Arrange
            var bookingServiceItemId = Guid.NewGuid();

            // Act
            var result = await _controller.GetBookingItemById(bookingServiceItemId);

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
            response.Message.Should().Be("No item detected");
        }

        [Fact]
        public async Task CreateServiceItem_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            var serviceVariantId = Guid.NewGuid();
            var petId = Guid.NewGuid();
            decimal price = 100.00m;
            
            // Create DTO with constructor parameters
            var createDto = new CreateBookingServiceItemDTO(bookingId, serviceVariantId, petId, price);

            A.CallTo(() => _bookingServiceItemInterface.CreateAsync(A<BookingServiceItem>._))
                .Returns(new Response(true, "Create service item successfully"));

            // Act
            var result = await _controller.CreateServiceItem(createDto);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Be("Create service item successfully");

            A.CallTo(() => _bookingServiceItemInterface.CreateAsync(A<BookingServiceItem>._))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task CreateServiceItem_WhenCreateFails_ReturnsBadRequest()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            var serviceVariantId = Guid.NewGuid();
            var petId = Guid.NewGuid();
            decimal price = 100.00m;
            
            // Create DTO with constructor parameters
            var createDto = new CreateBookingServiceItemDTO(bookingId, serviceVariantId, petId, price);

            A.CallTo(() => _bookingServiceItemInterface.CreateAsync(A<BookingServiceItem>._))
                .Returns(new Response(false, "Error occured adding new service item"));

            // Act
            var result = await _controller.CreateServiceItem(createDto);

            // Assert
            var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var response = badRequestResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
            response.Message.Should().Be("Error occured adding new service item");

            A.CallTo(() => _bookingServiceItemInterface.CreateAsync(A<BookingServiceItem>._))
                .MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task GetAll_WithExistingItems_ReturnsOkResult()
        {
            // Arrange
            var bookingItems = new List<BookingServiceItem>
            {
                new BookingServiceItem
                {
                    BookingServiceItemId = Guid.NewGuid(),
                    BookingId = Guid.NewGuid(),
                    ServiceVariantId = Guid.NewGuid(),
                    PetId = Guid.NewGuid(),
                    Price = 100.00m,
                    CreateAt = DateTime.Now,
                    UpdateAt = DateTime.Now
                },
                new BookingServiceItem
                {
                    BookingServiceItemId = Guid.NewGuid(),
                    BookingId = Guid.NewGuid(),
                    ServiceVariantId = Guid.NewGuid(),
                    PetId = Guid.NewGuid(),
                    Price = 150.00m,
                    CreateAt = DateTime.Now,
                    UpdateAt = DateTime.Now
                }
            };

            await _context.bookingServiceItems.AddRangeAsync(bookingItems);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeTrue();
            response.Message.Should().Be("BookingItems retrieved successfully");
            response.Data.Should().NotBeNull();
        }

        [Fact]
        public async Task GetAll_WithNoItems_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetAll();

            // Assert
            var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var response = notFoundResult.Value.Should().BeOfType<Response>().Subject;
            response.Flag.Should().BeFalse();
            response.Message.Should().Be("No BookingItems found in the database");
        }

        [Fact]
        public void BookingServiceItemConversion_ToEntityForCreate_ReturnsCorrectEntity()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            var serviceVariantId = Guid.NewGuid();
            var petId = Guid.NewGuid();
            decimal price = 100.00m;
            
            // Create DTO with constructor parameters
            var createDto = new CreateBookingServiceItemDTO(bookingId, serviceVariantId, petId, price);

            // Act
            var entity = BookingServiceItemConversion.ToEntityForCreate(createDto);

            // Assert
            entity.Should().NotBeNull();
            entity.BookingServiceItemId.Should().Be(Guid.Empty);
            entity.BookingId.Should().Be(createDto.BookingId);
            entity.ServiceVariantId.Should().Be(createDto.ServiceVariantId);
            entity.PetId.Should().Be(createDto.PetId);
            entity.Price.Should().Be(createDto.Price);
            entity.CreateAt.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(5));
            entity.UpdateAt.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public void BookingServiceItemConversion_ToEntity_ReturnsCorrectEntity()
        {
            // Arrange
            var dto = new BookingServiceItemDTO(
                Guid.NewGuid(),
                Guid.NewGuid(),
                Guid.NewGuid(),
                Guid.NewGuid(),
                100.00m,
                DateTime.Now,
                DateTime.Now
            );

            // Act
            var entity = BookingServiceItemConversion.ToEntity(dto);

            // Assert
            entity.Should().NotBeNull();
            entity.BookingServiceItemId.Should().Be(dto.BookingServiceItemId);
            entity.BookingId.Should().Be(dto.BookingId);
            entity.ServiceVariantId.Should().Be(dto.ServiceVariantId);
            entity.PetId.Should().Be(dto.PetId);
            entity.Price.Should().Be(dto.Price);
            entity.CreateAt.Should().Be(dto.CreateAt);
            entity.UpdateAt.Should().Be(dto.UpdateAt);
        }

        [Fact]
        public void BookingServiceItemConversion_FromEntity_WithSingleEntity_ReturnsCorrectDTO()
        {
            // Arrange
            var entity = new BookingServiceItem
            {
                BookingServiceItemId = Guid.NewGuid(),
                BookingId = Guid.NewGuid(),
                ServiceVariantId = Guid.NewGuid(),
                PetId = Guid.NewGuid(),
                Price = 100.00m,
                CreateAt = DateTime.Now,
                UpdateAt = DateTime.Now
            };

            // Act
            var (singleDto, _) = BookingServiceItemConversion.FromEntity(entity, null);

            // Assert
            singleDto.Should().NotBeNull();
            singleDto.BookingServiceItemId.Should().Be(entity.BookingServiceItemId);
            singleDto.BookingId.Should().Be(entity.BookingId);
            singleDto.ServiceVariantId.Should().Be(entity.ServiceVariantId);
            singleDto.PetId.Should().Be(entity.PetId);
            singleDto.Price.Should().Be(entity.Price);
            singleDto.CreateAt.Should().Be(entity.CreateAt);
            singleDto.UpdateAt.Should().Be(entity.UpdateAt);
        }
    }
}
