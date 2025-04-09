using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using ReservationApi.Infrastructure.Repositories;
using FluentAssertions;
using Xunit;
using ReservationApi.Application.DTOs;

namespace UnitTest.ReservationApi.Repositories
{
    public class BookingsRepositoryTest
    {
        private readonly ReservationServiceDBContext _context;
        private readonly BookingRepository _repository;

        public BookingsRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ReservationServiceDBContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ReservationServiceDBContext(options);
            _repository = new BookingRepository(_context);

            // Seed necessary data
            SeedTestData();
        }

        private void SeedTestData()
        {
            // Add booking statuses
            var pendingStatus = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Pending" };
            var confirmedStatus = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Confirmed" };
            var cancelledStatus = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Cancelled" };

            _context.BookingStatuses.AddRange(pendingStatus, confirmedStatus, cancelledStatus);
            _context.SaveChanges();
        }

        [Fact]
        public async Task CreateAsync_WhenValidInput_ReturnsSuccessResponse()
        {
            // Arrange
            var booking = new Booking
            {
                BookingId = Guid.NewGuid(),
                BookingCode = "ORD-123456",
                AccountId = Guid.NewGuid(),
                BookingStatusId = _context.BookingStatuses.First().BookingStatusId,
                PaymentTypeId = Guid.NewGuid(),
                BookingTypeId = Guid.NewGuid(),
                TotalAmount = 100,
                Notes = "Test booking"
            };

            // Act
            var result = await _repository.CreateAsync(booking);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeTrue();
            result.Message.Should().Be("Create Booking successfully");
            result.Data.Should().NotBeNull();
            result.Data.Should().BeOfType<BookingResponseDTO>();

            // Verify booking was added to database
            var savedBooking = await _context.Bookings.FindAsync(booking.BookingId);
            savedBooking.Should().NotBeNull();
            savedBooking.BookingCode.Should().Be("ORD-123456");
        }

        [Fact]
        public async Task CreateAsync_WhenBookingIdAlreadyExists_ReturnsFailureResponse()
        {
            // Arrange
            var existingBookingId = Guid.NewGuid();
            var existingBooking = new Booking
            {
                BookingId = existingBookingId,
                BookingCode = "ORD-EXIST",
                AccountId = Guid.NewGuid(),
                BookingStatusId = _context.BookingStatuses.First().BookingStatusId,
                PaymentTypeId = Guid.NewGuid(),
                BookingTypeId = Guid.NewGuid(),
                TotalAmount = 100
            };
            await _context.Bookings.AddAsync(existingBooking);
            await _context.SaveChangesAsync();

            var newBooking = new Booking
            {
                BookingId = existingBookingId, // Same ID as existing booking
                BookingCode = "ORD-NEW",
                AccountId = Guid.NewGuid(),
                BookingStatusId = _context.BookingStatuses.First().BookingStatusId,
                PaymentTypeId = Guid.NewGuid(),
                BookingTypeId = Guid.NewGuid(),
                TotalAmount = 200
            };

            // Act
            var result = await _repository.CreateAsync(newBooking);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Contain("Error occured adding new booking");
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllBookings()
        {
            // Arrange
            var bookings = new List<Booking>
            {
                new Booking
                {
                    BookingId = Guid.NewGuid(),
                    BookingCode = "ORD-111111",
                    AccountId = Guid.NewGuid(),
                    BookingStatusId = _context.BookingStatuses.First().BookingStatusId,
                    PaymentTypeId = Guid.NewGuid(),
                    BookingTypeId = Guid.NewGuid(),
                    TotalAmount = 100
                },
                new Booking
                {
                    BookingId = Guid.NewGuid(),
                    BookingCode = "ORD-222222",
                    AccountId = Guid.NewGuid(),
                    BookingStatusId = _context.BookingStatuses.First().BookingStatusId,
                    PaymentTypeId = Guid.NewGuid(),
                    BookingTypeId = Guid.NewGuid(),
                    TotalAmount = 200
                }
            };

            await _context.Bookings.AddRangeAsync(bookings);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(b => b.BookingCode == "ORD-111111");
            result.Should().Contain(b => b.BookingCode == "ORD-222222");
        }

        [Fact]
        public async Task GetAllBookingForUserAsync_ReturnsUserBookings()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var bookings = new List<Booking>
            {
                new Booking
                {
                    BookingId = Guid.NewGuid(),
                    BookingCode = "ORD-USER1",
                    AccountId = userId,
                    BookingStatusId = _context.BookingStatuses.First().BookingStatusId,
                    PaymentTypeId = Guid.NewGuid(),
                    BookingTypeId = Guid.NewGuid(),
                    TotalAmount = 100
                },
                new Booking
                {
                    BookingId = Guid.NewGuid(),
                    BookingCode = "ORD-USER2",
                    AccountId = userId,
                    BookingStatusId = _context.BookingStatuses.First().BookingStatusId,
                    PaymentTypeId = Guid.NewGuid(),
                    BookingTypeId = Guid.NewGuid(),
                    TotalAmount = 200
                },
                new Booking
                {
                    BookingId = Guid.NewGuid(),
                    BookingCode = "ORD-OTHER",
                    AccountId = Guid.NewGuid(), // Different user
                    BookingStatusId = _context.BookingStatuses.First().BookingStatusId,
                    PaymentTypeId = Guid.NewGuid(),
                    BookingTypeId = Guid.NewGuid(),
                    TotalAmount = 300
                }
            };

            await _context.Bookings.AddRangeAsync(bookings);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllBookingForUserAsync(userId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(b => b.BookingCode == "ORD-USER1");
            result.Should().Contain(b => b.BookingCode == "ORD-USER2");
            result.Should().NotContain(b => b.BookingCode == "ORD-OTHER");
        }

        [Fact]
        public async Task GetBookingByBookingCodeAsync_WhenExists_ReturnsBooking()
        {
            // Arrange
            var bookingCode = "ORD-UNIQUE";
            var booking = new Booking
            {
                BookingId = Guid.NewGuid(),
                BookingCode = bookingCode,
                AccountId = Guid.NewGuid(),
                BookingStatusId = _context.BookingStatuses.First().BookingStatusId,
                PaymentTypeId = Guid.NewGuid(),
                BookingTypeId = Guid.NewGuid(),
                TotalAmount = 100
            };
            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetBookingByBookingCodeAsync(bookingCode);

            // Assert
            result.Should().NotBeNull();
            result.BookingCode.Should().Be(bookingCode);
        }

        [Fact]
        public async Task GetBookingByBookingCodeAsync_WhenNotExists_ReturnsNull()
        {
            // Arrange
            var nonExistentCode = "ORD-NOTEXIST";

            // Act
            var result = await _repository.GetBookingByBookingCodeAsync(nonExistentCode);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetBookingByBookingStatusAsync_ReturnsFilteredBookings()
        {
            // Arrange
            var statusId = _context.BookingStatuses.First().BookingStatusId;
            var bookings = new List<Booking>
            {
                new Booking
                {
                    BookingId = Guid.NewGuid(),
                    BookingCode = "ORD-STATUS1",
                    AccountId = Guid.NewGuid(),
                    BookingStatusId = statusId,
                    PaymentTypeId = Guid.NewGuid(),
                    BookingTypeId = Guid.NewGuid(),
                    TotalAmount = 100
                },
                new Booking
                {
                    BookingId = Guid.NewGuid(),
                    BookingCode = "ORD-STATUS2",
                    AccountId = Guid.NewGuid(),
                    BookingStatusId = statusId,
                    PaymentTypeId = Guid.NewGuid(),
                    BookingTypeId = Guid.NewGuid(),
                    TotalAmount = 200
                },
                new Booking
                {
                    BookingId = Guid.NewGuid(),
                    BookingCode = "ORD-OTHER",
                    AccountId = Guid.NewGuid(),
                    BookingStatusId = Guid.NewGuid(), // Different status
                    PaymentTypeId = Guid.NewGuid(),
                    BookingTypeId = Guid.NewGuid(),
                    TotalAmount = 300
                }
            };

            await _context.Bookings.AddRangeAsync(bookings);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetBookingByBookingStatusAsync(statusId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(b => b.BookingCode == "ORD-STATUS1");
            result.Should().Contain(b => b.BookingCode == "ORD-STATUS2");
            result.Should().NotContain(b => b.BookingCode == "ORD-OTHER");
        }

        [Fact]
        public async Task GetByIdAsync_WhenExists_ReturnsBooking()
        {
            // Arrange
            var bookingId = Guid.NewGuid();
            var booking = new Booking
            {
                BookingId = bookingId,
                BookingCode = "ORD-BYID",
                AccountId = Guid.NewGuid(),
                BookingStatusId = _context.BookingStatuses.First().BookingStatusId,
                PaymentTypeId = Guid.NewGuid(),
                BookingTypeId = Guid.NewGuid(),
                TotalAmount = 100
            };
            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(bookingId);

            // Assert
            result.Should().NotBeNull();
            result.BookingId.Should().Be(bookingId);
        }

        [Fact]
        public async Task GetByIdAsync_WhenNotExists_ReturnsNull()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act
            var result = await _repository.GetByIdAsync(nonExistentId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task CancelBookingAsync_WhenNotExists_ReturnsFailure()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act
            var result = await _repository.CancelBookingAsync(nonExistentId);

            // Assert
            result.Should().NotBeNull();
            result.Flag.Should().BeFalse();
            result.Message.Should().Be("No detected any booking.");
        }
    }
}