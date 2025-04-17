using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PSPS.SharedLibrary.PSBSLogs;
using PSPS.SharedLibrary.Responses;
using ReservationApi.Application.Intefaces;
using ReservationApi.Domain.Entities;
using ReservationApi.Infrastructure.Data;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace ReservationApi.Infrastructure.BackgroundWorkers
{
    public class BookingStatusWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BookingStatusWorker> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5); // Check every minute

        public BookingStatusWorker(
            IServiceScopeFactory scopeFactory,
            ILogger<BookingStatusWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Booking Status Worker started at: {time}", DateTimeOffset.Now);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessBookingsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while processing bookings");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task ProcessBookingsAsync(CancellationToken stoppingToken)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ReservationServiceDBContext>();
                var bookingInterface = scope.ServiceProvider.GetRequiredService<IBooking>();

                try
                {
                    var pendingStatus = await dbContext.BookingStatuses
                       .FirstOrDefaultAsync(bs => bs.BookingStatusName.Contains("Pending"), stoppingToken);
if (pendingStatus == null)
                    {
                        _logger.LogWarning("Pending booking status not found");
                        return;
                    }
                    // Get the "Confirmed" booking status
                    var confirmedStatus = await dbContext.BookingStatuses
                        .FirstOrDefaultAsync(bs => bs.BookingStatusName.Contains("Confirmed"), stoppingToken);
                    

                    if (confirmedStatus == null)
                    {
                        _logger.LogWarning("Confirmed booking status not found");
                        return;
                    }

                    // Get the "Cancelled" booking status
                    var cancelledStatus = await dbContext.BookingStatuses
                        .FirstOrDefaultAsync(bs => bs.BookingStatusName.Contains("Cancelled"), stoppingToken);

                    if (cancelledStatus == null)
                    {
                        _logger.LogWarning("Cancelled booking status not found");
                        return;
                    }
                    // Get all pending bookings
                    var pendingBookings = await dbContext.Bookings
                        .Where(b => b.BookingStatusId == pendingStatus.BookingStatusId)
                        .ToListAsync(stoppingToken);
                    // Get all confirmed bookings
                    var confirmedBookings = await dbContext.Bookings
                        .Where(b => b.BookingStatusId == confirmedStatus.BookingStatusId)
                        .ToListAsync(stoppingToken);

                         // Combine both lists
                    var bookingsToCheck = confirmedBookings.Concat(pendingBookings).ToList();

                    _logger.LogInformation("Found {count} pending bookings to check", pendingBookings.Count);
                    _logger.LogInformation("Found {count} confirmed bookings to check", confirmedBookings.Count);
                    _logger.LogInformation("Found {count} bookings to check", bookingsToCheck.Count);

                    var now = DateTime.Now;
                    var bookingsToCancel = bookingsToCheck
                        .Where(b => b.BookingDate.AddMinutes(15) < now)
                        .ToList();

                    _logger.LogInformation("Found {count} bookings to cancel", bookingsToCancel.Count);

                    foreach (var booking in bookingsToCancel)
                    {
                        _logger.LogInformation("Cancelling booking {bookingId} with code {bookingCode}",
                            booking.BookingId, booking.BookingCode);

                        booking.BookingStatusId = cancelledStatus.BookingStatusId;
                        dbContext.Bookings.Update(booking);

                        // Log the status change
                        _logger.LogInformation("Booking {bookingId} status changed from Confirmed to Cancelled",
                            booking.BookingId);
                    }

                    if (bookingsToCancel.Any())
                    {
                        await dbContext.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation("Successfully cancelled {count} expired bookings",
                            bookingsToCancel.Count);
                    }
                }
                catch (Exception ex)
                {
                    LogExceptions.LogException(ex);
                    _logger.LogError(ex, "Error processing bookings for auto-cancellation");
                }
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Booking Status Worker stopping at: {time}", DateTimeOffset.Now);
            await base.StopAsync(cancellationToken);
        }
    }
}
