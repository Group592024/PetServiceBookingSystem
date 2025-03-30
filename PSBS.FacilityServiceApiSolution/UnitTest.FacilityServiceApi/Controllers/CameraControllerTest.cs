using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Presentation.Controllers;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Xunit;

public class CameraControllerTests
{
    private readonly Mock<ICamera> _cameraMock;
    private readonly CameraController _controller;

    public CameraControllerTests()
    {
        _cameraMock = new Mock<ICamera>();
        _controller = new CameraController(_cameraMock.Object);
    }

    [Fact]
    public async Task GetStreamUrl_CameraNotFound_ReturnsNotFound()
    {
        _cameraMock.Setup(repo => repo.GetByAsync(It.IsAny<Expression<Func<Camera, bool>>>()))
                   .ReturnsAsync((Camera)null);

        var result = await _controller.GetStreamUrl("invalid-code");

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetStreamUrl_CameraDeleted_ReturnsBadRequest()
    {
        var camera = new Camera { cameraCode = "test", isDeleted = true };
        _cameraMock.Setup(repo => repo.GetByAsync(It.IsAny<Expression<Func<Camera, bool>>>()))
                   .ReturnsAsync(camera);

        var result = await _controller.GetStreamUrl("test");

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task GetStreamUrl_CameraNotActive_ReturnsBadRequest()
    {
        var camera = new Camera { cameraCode = "test", cameraStatus = "Inactive" };
        _cameraMock.Setup(repo => repo.GetByAsync(It.IsAny<Expression<Func<Camera, bool>>>()))
                   .ReturnsAsync(camera);

        var result = await _controller.GetStreamUrl("test");

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task GetStreamUrl_CameraActive_ReturnsStreamUrl()
    {
        var camera = new Camera { cameraCode = "test", cameraStatus = "Active", cameraType = "IP", cameraAddress = "192.168.1.1" };
        _cameraMock.Setup(repo => repo.GetByAsync(It.IsAny<Expression<Func<Camera, bool>>>()))
                   .ReturnsAsync(camera);

        var result = await _controller.GetStreamUrl("test") as OkObjectResult;

        Assert.NotNull(result);
        Assert.Contains("streamUrl", result.Value.ToString());
    }

    [Fact]
    public async Task Create_CameraValid_ReturnsOk()
    {
        var camera = new Camera { cameraId = Guid.NewGuid(), cameraCode = "test" };
        var response = new PSPS.SharedLibrary.Responses.Response(true, "Created successfully");
        _cameraMock.Setup(repo => repo.CreateAsync(camera)).ReturnsAsync(response);

        var result = await _controller.Create(camera);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task UpdateCamera_CameraIdMismatch_ReturnsBadRequest()
    {
        var camera = new Camera { cameraId = Guid.NewGuid(), cameraCode = "test" };
        var differentId = Guid.NewGuid();

        var result = await _controller.UpdateCamera(differentId, camera);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task UpdateCamera_CameraValid_ReturnsOk()
    {
        var camera = new Camera { cameraId = Guid.NewGuid(), cameraCode = "test" };
        var response = new PSPS.SharedLibrary.Responses.Response(true, "Updated successfully");
        _cameraMock.Setup(repo => repo.UpdateAsync(camera)).ReturnsAsync(response);

        var result = await _controller.UpdateCamera(camera.cameraId, camera);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task DeleteCamera_CameraExists_ReturnsOk()
    {
        var camera = new Camera { cameraId = Guid.NewGuid(), cameraCode = "test" };
        var response = new PSPS.SharedLibrary.Responses.Response(true, "Deleted successfully");
        _cameraMock.Setup(repo => repo.GetByIdAsync(camera.cameraId)).ReturnsAsync(camera);
        _cameraMock.Setup(repo => repo.DeleteAsync(camera)).ReturnsAsync(response);

        var result = await _controller.DeleteCamera(camera.cameraId);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task DeleteCamera_CameraDoesNotExist_ReturnsNotFound()
    {
        _cameraMock.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Camera)null);

        var result = await _controller.DeleteCamera(Guid.NewGuid());

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetById_CameraExists_ReturnsOk()
    {
        var camera = new Camera { cameraId = Guid.NewGuid(), cameraCode = "test" };
        _cameraMock.Setup(repo => repo.GetByIdAsync(camera.cameraId)).ReturnsAsync(camera);

        var result = await _controller.GetById(camera.cameraId);

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetById_CameraDoesNotExist_ReturnsNotFound()
    {
        _cameraMock.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Camera)null);

        var result = await _controller.GetById(Guid.NewGuid());

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetAll_CamerasExist_ReturnsOk()
    {
        var cameras = new List<Camera> { new Camera { cameraId = Guid.NewGuid(), cameraCode = "test" } };
        _cameraMock.Setup(repo => repo.GetAllAsync()).ReturnsAsync(cameras);

        var result = await _controller.GetAll();

        Assert.IsType<OkObjectResult>(result);
    }
}
