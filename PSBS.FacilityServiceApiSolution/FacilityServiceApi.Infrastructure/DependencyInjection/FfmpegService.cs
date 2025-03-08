using System;
using System.Diagnostics;
using Microsoft.Extensions.Configuration;

namespace FacilityServiceApi.Infrastructure.Services
{
    public class FfmpegService
    {
        private readonly string _ffmpegPath;
        private readonly string _rtspUrl;
        private readonly string _hlsOutputPath;
        private readonly int _hlsSegmentTime;

        public FfmpegService(IConfiguration configuration)
        {
            _ffmpegPath = configuration["CameraConfig:FfmpegPath"];
            _rtspUrl = configuration["CameraConfig:RtspUrl"];
            _hlsOutputPath = configuration["CameraConfig:HlsOutputPath"];
            _hlsSegmentTime = int.Parse(configuration["CameraConfig:HlsSegmentTime"]);
        }

        public Process StartFfmpegConversion()
        {
            if (!System.IO.Directory.Exists(_hlsOutputPath))
            {
                System.IO.Directory.CreateDirectory(_hlsOutputPath);
            }

            string outputFilePath = Path.Combine(_hlsOutputPath, "output.m3u8");
            string arguments = $"-i \"{_rtspUrl}\" -c:v copy -c:a aac -f hls -hls_time {_hlsSegmentTime} -hls_list_size 3 -hls_flags delete_segments \"{outputFilePath}\"";

            var processInfo = new ProcessStartInfo
            {
                FileName = _ffmpegPath,
                Arguments = arguments,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            var process = new Process { StartInfo = processInfo };

            try
            {
                process.Start();
                return process;
            }
            catch (Exception ex)
            {
                throw new Exception("FFmpeg không thể khởi chạy: " + ex.Message);
            }
        }
    }
}
