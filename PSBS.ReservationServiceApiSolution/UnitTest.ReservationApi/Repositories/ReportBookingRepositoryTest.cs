using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ReservationApi.Application.DTOs;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using ReservationApi.Infrastructure.Repositories;


namespace UnitTest.ReservationApi.Repositories
{
    public class ReportBookingRepositoryTest
    {
        private readonly ReservationServiceDBContext _context;
        private readonly ReportBookingRepository _repository;

        public ReportBookingRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<ReservationServiceDBContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ReservationServiceDBContext(options);
            _repository = new ReportBookingRepository(_context);
        }

        [Fact]
        public async Task GetAllBookingStatusIncludeBookingAsync_ShouldReturnBookingStatusList_WhenDataExists()
        {
            // Arrange
            var bookingStatus1 = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Confirmed", isDeleted = false };
            var bookingStatus2 = new BookingStatus { BookingStatusId = Guid.NewGuid(), BookingStatusName = "Pending", isDeleted = false };

            var booking1 = new Booking { BookingId = Guid.NewGuid(), BookingStatusId = bookingStatus1.BookingStatusId, TotalAmount = 100, isPaid = true };
            var booking2 = new Booking { BookingId = Guid.NewGuid(), BookingStatusId = bookingStatus1.BookingStatusId, TotalAmount = 150, isPaid = false };
            var booking3 = new Booking { BookingId = Guid.NewGuid(), BookingStatusId = bookingStatus2.BookingStatusId, TotalAmount = 200, isPaid = true };

            bookingStatus1.Bookings = new List<Booking> { booking1, booking2 };
            bookingStatus2.Bookings = new List<Booking> { booking3 };

            await _context.BookingStatuses.AddRangeAsync(bookingStatus1, bookingStatus2);
            await _context.Bookings.AddRangeAsync(booking1, booking2, booking3);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllBookingStatusIncludeBookingAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(bs => bs.BookingStatusName == "Confirmed" && bs.Bookings.Count == 2);
            result.Should().Contain(bs => bs.BookingStatusName == "Pending" && bs.Bookings.Count == 1);
        }

        [Fact]
        public async Task GetTotalIncomeByBookingTypeAsync_ShouldReturnCorrectIncome_WhenDataExists()
        {
            // Arrange
            var year = 2024;
            var month = 3;
            var startDate = new DateTime(2024, 03, 01);
            var endDate = new DateTime(2024, 03, 31);

            var bookingType1 = new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Hotel" };
            var bookingType2 = new BookingType { BookingTypeId = Guid.NewGuid(), BookingTypeName = "Spa" };

            var bookings = new List<Booking>
        {
            new Booking { BookingId = Guid.NewGuid(), BookingTypeId = bookingType1.BookingTypeId, BookingDate = new DateTime(2024, 03, 10), TotalAmount = 200, isPaid = true },
            new Booking { BookingId = Guid.NewGuid(), BookingTypeId = bookingType1.BookingTypeId, BookingDate = new DateTime(2024, 03, 15), TotalAmount = 300, isPaid = true },
            new Booking { BookingId = Guid.NewGuid(), BookingTypeId = bookingType2.BookingTypeId, BookingDate = new DateTime(2024, 03, 20), TotalAmount = 150, isPaid = true },
            new Booking { BookingId = Guid.NewGuid(), BookingTypeId = bookingType1.BookingTypeId, BookingDate = new DateTime(2024, 02, 10), TotalAmount = 500, isPaid = true }, // Different month
            new Booking { BookingId = Guid.NewGuid(), BookingTypeId = bookingType1.BookingTypeId, BookingDate = new DateTime(2024, 03, 25), TotalAmount = 400, isPaid = false } // Not paid
        };

            await _context.BookingTypes.AddRangeAsync(bookingType1, bookingType2);
            await _context.Bookings.AddRangeAsync(bookings);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetTotalIncomeByBookingTypeAsync(year, month, startDate, endDate);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            var hotelReport = result.FirstOrDefault(r => r.BookingTypeName == "Hotel");
            hotelReport.Should().NotBeNull();
            hotelReport!.AmountDTOs.Sum(a => a.Amount).Should().Be(500); // 200 + 300 (paid in March)

            var spaReport = result.FirstOrDefault(r => r.BookingTypeName == "Spa");
            spaReport.Should().NotBeNull();
            spaReport!.AmountDTOs.Sum(a => a.Amount).Should().Be(150); // Only one paid booking in March
        }

        [Fact]
        public async Task HandleAmountDTO_ShouldReturnCorrectAmounts_WhenFilteredByYear()
        {
            // Arrange
            var year = 2024;

            var bookings = new List<Booking>
        {
            new Booking { BookingId = Guid.NewGuid(), BookingDate = new DateTime(2024, 01, 10), TotalAmount = 200 },
            new Booking { BookingId = Guid.NewGuid(), BookingDate = new DateTime(2024, 05, 15), TotalAmount = 300 },
            new Booking { BookingId = Guid.NewGuid(), BookingDate = new DateTime(2024, 10, 25), TotalAmount = 500 },
        };

            // Act
            var result = await _repository.HandleAmountDTO(bookings, year, null, null, null);

            // Assert
            result.Should().HaveCount(12);
            result.Should().ContainEquivalentOf(new AmountDTO("1", 200));
            result.Should().ContainEquivalentOf(new AmountDTO("5", 300));
            result.Should().ContainEquivalentOf(new AmountDTO("10", 500));
            result.Should().ContainEquivalentOf(new AmountDTO("6", 0)); // No bookings in June
        }

    }
}
