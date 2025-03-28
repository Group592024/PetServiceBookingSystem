using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using FacilityServiceApi.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace UnitTest.FacilityServiceApi.Repositories
{
    public class ReportFacilityRepositoryTest
    {
        private readonly FacilityServiceDbContext _context;
        private readonly ReportFacilityRepository _repository;

        public ReportFacilityRepositoryTest()
        {
            var options = new DbContextOptionsBuilder<FacilityServiceDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new FacilityServiceDbContext(options);
            _repository = new ReportFacilityRepository(_context);
        }

        [Fact]
        public async Task GetRoomStatusList_ShouldReturnSuccess()
        {
            // Arrange
            var rooms = new List<Room>
    {
        new Room
        {
            roomId = Guid.NewGuid(),
            roomTypeId = Guid.NewGuid(),
            roomName = "Room A",
            description = "Description A",
            status = "Available",
            isDeleted = false,
            roomImage = "imageA.jpg",
            hasCamera = true
        },
        new Room
        {
            roomId = Guid.NewGuid(),
            roomTypeId = Guid.NewGuid(),
            roomName = "Room B",
            description = "Description B",
            status = "Occupied",
            isDeleted = false,
            roomImage = "imageB.jpg",
            hasCamera = false
        },
        new Room
        {
            roomId = Guid.NewGuid(),
            roomTypeId = Guid.NewGuid(),
            roomName = "Room C",
            description = "Description C",
            status = "Available",
            isDeleted = false,
            roomImage = "imageC.jpg",
            hasCamera = false
        }
    };

            await _context.Room.AddRangeAsync(rooms);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetRoomStatusList();

            // Assert
            result.Should().HaveCount(2);
            result.Should().Contain(x => x.status == "Available" && x.quantity == 2);
            result.Should().Contain(x => x.status == "Occupied" && x.quantity == 1);
        }



        [Fact]
        public void CheckRoomHistoryByDate_ShouldReturnSuccess()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var petId = Guid.NewGuid();
            var bookingId = Guid.NewGuid();
            var startDate = new DateTime(2025, 03, 23);
            var endDate = startDate.AddDays(3);

            var roomHistory = new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                RoomId = roomId,
                PetId = petId,
                BookingId = bookingId,
                Status = "Checked",
                BookingStartDate = startDate,
                BookingEndDate = endDate,
                BookingCamera = false,
                CheckInDate = startDate,
                CheckOutDate = endDate
            };

            // Act
            var result = _repository.CheckRoomHistoryByDate(roomHistory, startDate, endDate);

            // Assert
            result.Should().BeTrue();
        }


        [Fact]
        public void CheckRoomHistoryByMonth_ShouldReturnSuccess()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var petId = Guid.NewGuid();
            var bookingId = Guid.NewGuid();

            var checkInDate = new DateTime(2025, 03, 15);
            var checkOutDate = new DateTime(2025, 05, 10);
            var roomHistory = new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                RoomId = roomId,
                PetId = petId,
                BookingId = bookingId,
                Status = "Checked",
                BookingStartDate = checkInDate,
                BookingEndDate = checkOutDate,
                BookingCamera = false,
                CheckInDate = checkInDate,
                CheckOutDate = checkOutDate
            };

            int year = 2025;
            int month = 4;

            // Act
            var result = _repository.CheckRoomHistoryByMonth(roomHistory, year, month);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task GetRoomHistotyQuantity_ShouldReturnListSuccessfully()
        {
            // Arrange
            var roomType1 = new RoomType { roomTypeId = Guid.NewGuid(), name = "Deluxe", description = "Description" };
            var roomType2 = new RoomType { roomTypeId = Guid.NewGuid(), name = "Standard", description = "Description" };

            _context.RoomType.AddRange(roomType1, roomType2);
            await _context.SaveChangesAsync();

            var room1 = new Room
            {
                roomId = Guid.NewGuid(),
                roomTypeId = roomType1.roomTypeId,
                RoomType = roomType1,
                roomName = "Deluxe Pet Suite",
                description = "Spacious room with pet-friendly furniture",
                status = "Available",
                roomImage = "deluxe_room.jpg",
                isDeleted = false,
                hasCamera = true,
                RoomHistories = new List<RoomHistory>
        {
            new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                CheckInDate = new DateTime(2025, 02, 10),
                CheckOutDate = new DateTime(2025, 02, 20),
                Status = "checked"
            },
            new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                CheckInDate = new DateTime(2025, 03, 05),
                CheckOutDate = new DateTime(2025, 03, 15),
                Status = "checked"
            }
        }
            };

            var room2 = new Room
            {
                roomId = Guid.NewGuid(),
                roomTypeId = roomType2.roomTypeId,
                RoomType = roomType2,
                roomName = "Deluxe Pet Suite 2",
                description = "Spacious room with pet-friendly furniture 2",
                status = "Available",
                roomImage = "deluxe_room.jpg",
                isDeleted = false,
                hasCamera = true,
                RoomHistories = new List<RoomHistory>()
            };

            _context.Room.AddRange(room1, room2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetRoomHistotyQuantity(2025, 3, null, null);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            var deluxeRoom = result.First(r => r.roomTypeName == "Deluxe");
            deluxeRoom.quantity.Should().Be(1);

            var standardRoom = result.First(r => r.roomTypeName == "Standard");
            standardRoom.quantity.Should().Be(0);


        }

        [Fact]
        public async Task GetRoomTypeQuantity_ShouldReturnGroupedListSuccessfully()
        {
            // Arrange
            var roomType1 = new RoomType { roomTypeId = Guid.NewGuid(), name = "Deluxe", description = "Luxury pet room" };
            var roomType2 = new RoomType { roomTypeId = Guid.NewGuid(), name = "Standard", description = "Basic pet room" };

            _context.RoomType.AddRange(roomType1, roomType2);
            await _context.SaveChangesAsync();

            var room1 = new Room
            {
                roomId = Guid.NewGuid(),
                roomTypeId = roomType1.roomTypeId,
                RoomType = roomType1,
                roomName = "Deluxe Pet Suite",
                description = "Spacious room with pet-friendly furniture",
                status = "Available",
                roomImage = "deluxe_room.jpg",
                isDeleted = false,
                hasCamera = true,
                RoomHistories = new List<RoomHistory>
        {
            new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                CheckInDate = new DateTime(2025, 02, 10),
                CheckOutDate = new DateTime(2025, 02, 20),
                Status = "checked"
            },
            new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                CheckInDate = new DateTime(2025, 03, 05),
                CheckOutDate = new DateTime(2025, 03, 15),
                Status = "checked"
            }
        }
            };

            var room2 = new Room
            {
                roomId = Guid.NewGuid(),
                roomTypeId = roomType2.roomTypeId,
                RoomType = roomType2,
                roomName = "Standard Pet Room",
                description = "Standard room with basic amenities",
                status = "Available",
                roomImage = "standard_room.jpg",
                isDeleted = false,
                hasCamera = false,
                RoomHistories = new List<RoomHistory>
        {
            new RoomHistory
            {
                RoomHistoryId = Guid.NewGuid(),
                CheckInDate = new DateTime(2025, 03, 01),
                CheckOutDate = new DateTime(2025, 03, 10),
                Status = "checked"
            }
        }
            };

            _context.Room.AddRange(room1, room2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetRoomTypeQuantity(2025, 3, null, null);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            var deluxeRoom = result.First(r => r.roomTypeName == "Deluxe");
            deluxeRoom.quantity.Should().Be(1);

            var standardRoom = result.First(r => r.roomTypeName == "Standard");
            standardRoom.quantity.Should().Be(1);
        }


        [Fact]
        public async Task GetBookingServiceItemQuantity_ShouldReturnGroupedListSuccessfully()
        {
            // Arrange
            var service1 = new Service { serviceId = Guid.NewGuid(), serviceName = "Grooming", serviceImage = "", serviceDescription = "Pet grooming service" };
            var service2 = new Service { serviceId = Guid.NewGuid(), serviceName = "Boarding", serviceImage = "", serviceDescription = "Pet boarding service" };

            var variant1 = new ServiceVariant { serviceVariantId = Guid.NewGuid(), serviceId = service1.serviceId, Service = service1, serviceContent = "Full Groom" };
            var variant2 = new ServiceVariant { serviceVariantId = Guid.NewGuid(), serviceId = service2.serviceId, Service = service2, serviceContent = "Overnight Stay" };

            _context.ServiceVariant.AddRange(variant1, variant2);
            await _context.SaveChangesAsync();

            var bookingItem1 = new BookingServiceItem
            {
                BookingServiceItemId = Guid.NewGuid(),
                ServiceVariantId = variant1.serviceVariantId,
                ServiceVariant = variant1,
                CreateAt = new DateTime(2025, 03, 10)
            };

            var bookingItem2 = new BookingServiceItem
            {
                BookingServiceItemId = Guid.NewGuid(),
                ServiceVariantId = variant2.serviceVariantId,
                ServiceVariant = variant2,
                CreateAt = new DateTime(2025, 03, 15)
            };

            _context.bookingServiceItems.AddRange(bookingItem1, bookingItem2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetBookingServiceItemQuantity(2025, 3, null, null);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2); // Two service types should be returned

            var groomingService = result.First(r => r.roomTypeName == "Grooming");
            groomingService.quantity.Should().Be(1); // One booking item in March 2025

            var boardingService = result.First(r => r.roomTypeName == "Boarding");
            boardingService.quantity.Should().Be(1); // One booking item in March 2025
        }


        [Fact]
        public async Task GetServiceQuantity_ShouldReturnGroupedListSuccessfully()
        {
            // Arrange
            var serviceType = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "Pet Care",
                description = "Testing..."
            };

            var service1 = new Service
            {
                serviceId = Guid.NewGuid(),
                serviceTypeId = serviceType.serviceTypeId,
                serviceName = "Grooming",
                serviceImage = "grooming.jpg",
                serviceDescription = "Pet grooming service",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false,
                ServiceType = serviceType
            };

            var service2 = new Service
            {
                serviceId = Guid.NewGuid(),
                serviceTypeId = serviceType.serviceTypeId,
                serviceName = "Boarding",
                serviceImage = "boarding.jpg",
                serviceDescription = "Pet boarding service",
                createAt = DateTime.UtcNow,
                updateAt = DateTime.UtcNow,
                isDeleted = false,
                ServiceType = serviceType
            };

            _context.ServiceType.Add(serviceType);
            _context.Service.AddRange(service1, service2);
            await _context.SaveChangesAsync();

            var variant1 = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = service1.serviceId,
                Service = service1,
                serviceContent = "test 1"
            };

            var variant2 = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = service2.serviceId,
                Service = service2,
                serviceContent = "test 2"
            };

            _context.ServiceVariant.AddRange(variant1, variant2);
            await _context.SaveChangesAsync();

            var bookingItem1 = new BookingServiceItem
            {
                BookingServiceItemId = Guid.NewGuid(),
                ServiceVariantId = variant1.serviceVariantId,
                ServiceVariant = variant1,
                CreateAt = new DateTime(2025, 03, 10)
            };

            var bookingItem2 = new BookingServiceItem
            {
                BookingServiceItemId = Guid.NewGuid(),
                ServiceVariantId = variant2.serviceVariantId,
                ServiceVariant = variant2,
                CreateAt = new DateTime(2025, 03, 15)
            };

            _context.bookingServiceItems.AddRange(bookingItem1, bookingItem2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetServiceQuantity(2025, 3, null, null);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            var groomingService = result.First(r => r.roomTypeName == "Grooming");
            groomingService.quantity.Should().Be(1);

            var boardingService = result.First(r => r.roomTypeName == "Boarding");
            boardingService.quantity.Should().Be(1);
        }

        [Fact]
        public async Task GetAllBookingByPet_ShouldReturnGroupedBookingsSuccessfully()
        {
            // Arrange
            var petId = Guid.NewGuid();
            var serviceId = Guid.NewGuid();

            var serviceVariant1 = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = serviceId,
                serviceContent = "Full Groom",
                isDeleted = false
            };

            var serviceVariant2 = new ServiceVariant
            {
                serviceVariantId = Guid.NewGuid(),
                serviceId = serviceId,
                serviceContent = "Overnight Stay",
                isDeleted = false
            };

            var bookingItem1 = new BookingServiceItem
            {
                BookingServiceItemId = Guid.NewGuid(),
                ServiceVariantId = serviceVariant1.serviceVariantId,
                PetId = petId,
                BookingId = Guid.NewGuid(),
                CreateAt = new DateTime(2025, 03, 10)
            };

            var bookingItem2 = new BookingServiceItem
            {
                BookingServiceItemId = Guid.NewGuid(),
                ServiceVariantId = serviceVariant2.serviceVariantId,
                PetId = petId,
                BookingId = Guid.NewGuid(),
                CreateAt = new DateTime(2025, 03, 15)
            };

            var serviceVariants = new List<ServiceVariant> { serviceVariant1, serviceVariant2 };
            var bookingServiceItems = new List<BookingServiceItem> { bookingItem1, bookingItem2 };

            _context.ServiceVariant.AddRange(serviceVariants);
            _context.bookingServiceItems.AddRange(bookingServiceItems);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllBookingByPet(serviceId, 2025, 3, null, null);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);

            var petBooking = result.First(r => r.petId == petId);
            petBooking.count.Should().Be(2);
        }

        [Fact]
        public async Task ListActiveRoomsAsync_ShouldReturnOnlyActiveRooms()
        {
            // Arrange
            var activeRoom1 = new Room
            {
                roomId = Guid.NewGuid(),
                roomName = "Room A",
                description = "room a",
                status = "room a",
                roomImage = "room a",
                isDeleted = false
            };

            var activeRoom2 = new Room
            {
                roomId = Guid.NewGuid(),
                roomName = "Room B",
                description = "room a",
                status = "room a",
                roomImage = "room a",
                isDeleted = false
            };

            var deletedRoom = new Room
            {
                roomId = Guid.NewGuid(),
                roomName = "Room C",
                description = "room a",
                status = "room a",
                roomImage = "room a",
                isDeleted = true
            };

            var rooms = new List<Room> { activeRoom1, activeRoom2, deletedRoom };

            _context.Room.AddRange(rooms);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ListActiveRoomsAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().OnlyContain(r => !r.isDeleted);
        }

        [Fact]
        public async Task GetActiveRoomTypeList_ShouldReturnCorrectRoomCounts()
        {
            // Arrange
            var roomType1 = new RoomType
            {
                roomTypeId = Guid.NewGuid(),
                name = "Deluxe",
                description = "Deluxe",
                Rooms = new List<Room>
                {
                    new Room { roomId = Guid.NewGuid(),                 roomName = "Room A",
                description = "room a",
                status = "room a",
                roomImage = "room a", isDeleted = false },

                    new Room { roomId = Guid.NewGuid(),                 roomName = "Room b",
                description = "room b",
                status = "room b",
                roomImage = "room b", isDeleted = false },

                    new Room { roomId = Guid.NewGuid(),                 roomName = "Room c",
                description = "room c",
                status = "room c",
                roomImage = "room c", isDeleted = true } // Deleted room
                }
            };

            var roomType2 = new RoomType
            {
                roomTypeId = Guid.NewGuid(),
                name = "Standard",
                description = "Standard",
                Rooms = new List<Room>
                {
                    new Room { roomId = Guid.NewGuid(),                 roomName = "Room d",
                description = "room d",
                status = "room d",
                roomImage = "room d", isDeleted = false },
                    new Room { roomId = Guid.NewGuid(),                 roomName = "Room 3",
                description = "room 3",
                status = "room 3",
                roomImage = "room 3", isDeleted = true }
                }
            };

            var roomTypes = new List<RoomType> { roomType1, roomType2 };

            _context.RoomType.AddRange(roomTypes);
            await _context.SaveChangesAsync();


            // Act
            var result = await _repository.GetActiveRoomTypeList();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().ContainEquivalentOf(new RoomHistoryQuantityDTO("Deluxe", 2));
            result.Should().ContainEquivalentOf(new RoomHistoryQuantityDTO("Standard", 1));
        }

        [Fact]
        public async Task GetActiveServiceTypeList_ShouldReturnCorrectServiceCounts()
        {
            // Arrange
            var serviceType1 = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "Grooming",
                description = "Standard",
                Services = new List<Service>
                {
                    new Service { serviceId = Guid.NewGuid(), serviceName = "Grooming2", serviceImage = "", serviceDescription = "Pet grooming service2", isDeleted = false },
                    new Service { serviceId = Guid.NewGuid(), serviceName = "Grooming3", serviceImage = "", serviceDescription = "Pet grooming service3", isDeleted = false },
                    new Service { serviceId = Guid.NewGuid(), serviceName = "Grooming4", serviceImage = "", serviceDescription = "Pet grooming service4", isDeleted = true } // Deleted service
                }
            };

            var serviceType2 = new ServiceType
            {
                serviceTypeId = Guid.NewGuid(),
                typeName = "Veterinary",
                description = "Standard_2",
                Services = new List<Service>
                {
                    new Service { serviceId = Guid.NewGuid(), serviceName = "Grooming1", serviceImage = "", serviceDescription = "Pet grooming service1", isDeleted = false },
                    new Service { serviceId = Guid.NewGuid(), serviceName = "Grooming5", serviceImage = "", serviceDescription = "Pet grooming service5", isDeleted = true }
                }
            };

            var serviceTypes = new List<ServiceType> { serviceType1, serviceType2 };

            _context.ServiceType.AddRange(serviceTypes);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetActiveServiceTypeList();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().ContainEquivalentOf(new RoomHistoryQuantityDTO("Grooming", 2));
            result.Should().ContainEquivalentOf(new RoomHistoryQuantityDTO("Veterinary", 1));
        }

    }
}
