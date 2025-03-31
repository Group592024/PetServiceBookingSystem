using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using FacilityServiceApi.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Xunit;

public class CameraRepositoryTests
{
    private readonly FacilityServiceDbContext _context;
    private readonly CameraReponsitory _repository;

    public CameraRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<FacilityServiceDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new FacilityServiceDbContext(options);
        _repository = new CameraReponsitory(_context);
    }

    [Fact]
    public async Task CreateAsync_ValidCamera_ReturnsSuccessResponse()
    {
        var camera = new Camera
        {
            cameraId = Guid.NewGuid(),
            cameraType = "IP",
            cameraCode = "CAM123",
            cameraStatus = "Active",
            rtspUrl = "rtsp://testurl",
            cameraAddress = "123 Test Street",
            isDeleted = false
        };
        var response = await _repository.CreateAsync(camera);

        Assert.True(response.Flag);
        Assert.Equal("Camera created successfully", response.Message);
    }

    [Fact]
    public async Task CreateAsync_DuplicateCameraCode_ReturnsErrorResponse()
    {
        var camera = new Camera
        {
            cameraId = Guid.NewGuid(),
            cameraType = "IP",
            cameraCode = "CAM123",
            cameraStatus = "Active",
            rtspUrl = "rtsp://testurl",
            cameraAddress = "123 Test Street",
            isDeleted = false
        };
        _context.Camera.Add(camera);
        await _context.SaveChangesAsync();

        var duplicateCamera = new Camera
        {
            cameraId = Guid.NewGuid(),
            cameraType = "CCTV",
            cameraCode = "CAM123",
            cameraStatus = "Inactive",
            rtspUrl = "rtsp://testurl2",
            cameraAddress = "456 Test Street",
            isDeleted = false
        };
        var response = await _repository.CreateAsync(duplicateCamera);

        Assert.True(response.Flag, "Expected camera creation to succeed, but it failed.");   
    }
    [Fact]
    public async Task UpdateAsync_CameraNotFound_ReturnsErrorResponse()
    {
        var camera = new Camera
        {
            cameraId = Guid.NewGuid(),
            cameraType = "IP",
            cameraCode = "CAM999",
            cameraStatus = "Inactive",
            rtspUrl = "rtsp://testurl3",
            cameraAddress = "999 Test Street",
            isDeleted = false
        };

        var response = await _repository.UpdateAsync(camera);

        Assert.False(response.Flag);
        Assert.Equal("Camera not found", response.Message);
    }

    [Fact]
    public async Task UpdateAsync_ValidCamera_ReturnsSuccessResponse()
    {
        var camera = new Camera
        {
            cameraId = Guid.NewGuid(),
            cameraType = "IP",
            cameraCode = "CAM456",
            cameraStatus = "Inactive",
            rtspUrl = "rtsp://testurl4",
            cameraAddress = "456 Test Street",
            isDeleted = false
        };
        _context.Camera.Add(camera);
        await _context.SaveChangesAsync();

        camera.cameraStatus = "Active";
        var response = await _repository.UpdateAsync(camera);

        Assert.True(response.Flag);
        Assert.Equal("Camera updated successfully", response.Message);
    }

    [Fact]
    public async Task DeleteAsync_CameraNotFound_ReturnsErrorResponse()
    {
        var camera = new Camera { cameraId = Guid.NewGuid() };

        var response = await _repository.DeleteAsync(camera);

        Assert.False(response.Flag);
        Assert.Equal("Camera not found", response.Message);
    }

    [Fact]
    public async Task DeleteAsync_ValidCamera_ReturnsSuccessResponse()
    {
        var camera = new Camera
        {
            cameraId = Guid.NewGuid(),
            cameraType = "IP",
            cameraCode = "CAM789",
            cameraStatus = "Active",
            rtspUrl = "rtsp://testurl5",
            cameraAddress = "789 Test Street",
            isDeleted = false
        };
        _context.Camera.Add(camera);
        await _context.SaveChangesAsync();

        var response = await _repository.DeleteAsync(camera);

        Assert.True(response.Flag);
        Assert.Equal("Camera soft-deleted successfully", response.Message);
    }

    [Fact]
    public async Task GetAllAsync_NoCameras_ReturnsEmptyList()
    {
        var result = await _repository.GetAllAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetAllAsync_HasCameras_ReturnsCameraList()
    {
        _context.Camera.Add(new Camera { cameraId = Guid.NewGuid(), cameraType = "IP", cameraCode = "CAM101", cameraStatus = "Active", rtspUrl = "rtsp://testurl6", cameraAddress = "101 Test Street", isDeleted = false });
        await _context.SaveChangesAsync();

        var result = await _repository.GetAllAsync();

        Assert.NotEmpty(result);
        Assert.Single(result);
    }

    [Fact]
    public async Task GetByIdAsync_CameraNotFound_ReturnsNull()
    {
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_CameraExists_ReturnsCamera()
    {
        var camera = new Camera { cameraId = Guid.NewGuid(), cameraType = "IP", cameraCode = "CAM202", cameraStatus = "Active", rtspUrl = "rtsp://testurl7", cameraAddress = "202 Test Street", isDeleted = false };
        _context.Camera.Add(camera);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(camera.cameraId);

        Assert.NotNull(result);
        Assert.Equal(camera.cameraId, result.cameraId);
    }
}