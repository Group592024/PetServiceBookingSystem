using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using FacilityServiceApi.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;
using Xunit;

namespace UnitTest.FacilityServiceApi.Repositories
{
    public class BookingServiceItemRepositoryTest
    {
        private readonly FacilityServiceDbContext _context;
        private readonly BookingServiceItemRepository _repository;

        public BookingServiceItemRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<FacilityServiceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new FacilityServiceDbContext(options);
            _repository = new BookingServiceItemRepository(_context);
        }

        [Fact]
        public async Task CreateAsync_WithValidEntity_ReturnsSuccessResponse()
        {
            // Arrange
            var bookingServiceItem = new BookingServiceItem
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
            var result = await _repository.CreateAsync(bookingServiceItem);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("Create service item successfully");

            // Verify booking service item was added to database
            var savedItem = await _context.bookingServiceItems.FindAsync(bookingServiceItem.BookingServiceItemId);
            savedItem.Should().NotBeNull();
            savedItem.Price.Should().Be(100.00m);
        }

        [Fact]
        public async Task CreateAsync_WhenSaveFails_ReturnsErrorResponse()
        {
            // Arrange
            var bookingServiceItem = new BookingServiceItem
            {
                BookingServiceItemId = Guid.NewGuid(),
                BookingId = Guid.NewGuid(),
                ServiceVariantId = Guid.NewGuid(),
                PetId = Guid.NewGuid(),
                Price = 100.00m
            };

            // Simulate DB failure by disposing the context
            await _context.DisposeAsync();

            // Act
            var result = await _repository.CreateAsync(bookingServiceItem);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("Error occured adding new service item");
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllBookingServiceItems()
        {
            // Arrange
            var bookingServiceItems = new List<BookingServiceItem>
            {
                new BookingServiceItem {
                    BookingServiceItemId = Guid.NewGuid(),
                    BookingId = Guid.NewGuid(),
                    ServiceVariantId = Guid.NewGuid(),
                    PetId = Guid.NewGuid(),
                    Price = 100.00m,
                    CreateAt = DateTime.Now,
                    UpdateAt = DateTime.Now
                },
                new BookingServiceItem {
                    BookingServiceItemId = Guid.NewGuid(),
                    BookingId = Guid.NewGuid(),
                    ServiceVariantId = Guid.NewGuid(),
                    PetId = Guid.NewGuid(),
                    Price = 150.00m,
                    CreateAt = DateTime.Now,
                    UpdateAt = DateTime.Now
                },
                new BookingServiceItem {
                    BookingServiceItemId = Guid.NewGuid(),
                    BookingId = Guid.NewGuid(),
                    ServiceVariantId = Guid.NewGuid(),
                    PetId = Guid.NewGuid(),
                    Price = 200.00m,
                    CreateAt = DateTime.Now,
                    UpdateAt = DateTime.Now
                }
            };

            await _context.bookingServiceItems.AddRangeAsync(bookingServiceItems);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(3);
            result.Should().ContainEquivalentOf(bookingServiceItems[0]);
            result.Should().ContainEquivalentOf(bookingServiceItems[1]);
            result.Should().ContainEquivalentOf(bookingServiceItems[2]);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsEmptyList_WhenNoBookingServiceItemsExist()
        {
            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task CheckIfVariantHasBooking_WithExistingBooking_ReturnsTrue()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();
            var bookingServiceItem = new BookingServiceItem
            {
                BookingServiceItemId = Guid.NewGuid(),
                BookingId = Guid.NewGuid(),
                ServiceVariantId = serviceVariantId,
                PetId = Guid.NewGuid(),
                Price = 100.00m,
                CreateAt = DateTime.Now,
                UpdateAt = DateTime.Now
            };

            await _context.bookingServiceItems.AddAsync(bookingServiceItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.CheckIfVariantHasBooking(serviceVariantId);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task CheckIfVariantHasBooking_WithNoBooking_ReturnsFalse()
        {
            // Arrange
            var serviceVariantId = Guid.NewGuid();

            // Act
            var result = await _repository.CheckIfVariantHasBooking(serviceVariantId);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task CheckBookingsForPetAsync_WithExistingBooking_ReturnsTrue()
        {
            // Arrange
            var petId = Guid.NewGuid();
            var bookingServiceItem = new BookingServiceItem
            {
                BookingServiceItemId = Guid.NewGuid(),
                BookingId = Guid.NewGuid(),
                ServiceVariantId = Guid.NewGuid(),
                PetId = petId,
                Price = 100.00m,
                CreateAt = DateTime.Now,
                UpdateAt = DateTime.Now
            };

            await _context.bookingServiceItems.AddAsync(bookingServiceItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.CheckBookingsForPetAsync(petId);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task CheckBookingsForPetAsync_WithNoBooking_ReturnsFalse()
        {
            // Arrange
            var petId = Guid.NewGuid();

            // Act
            var result = await _repository.CheckBookingsForPetAsync(petId);

            // Assert
            result.Should().BeFalse();
        }
    }
}
