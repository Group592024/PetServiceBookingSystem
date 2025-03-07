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
            // Đảm bảo thư mục output tồn tại
            if (!System.IO.Directory.Exists(_hlsOutputPath))
            {
                System.IO.Directory.CreateDirectory(_hlsOutputPath);
            }

            // Cấu hình tham số FFmpeg:
            // -i: input là RTSP URL
            // -c:v copy: copy video không mã hóa lại (nếu cần mã hóa thì thay đổi tùy chọn)
            // -c:a aac: mã hóa âm thanh sang AAC (nếu có)
            // -f hls: định dạng HLS
            // -hls_time: thời gian mỗi segment
            // -hls_list_size 3: chỉ giữ 3 segment trong playlist
            // -hls_flags delete_segments: tự động xóa các segment cũ
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
                // Bạn có thể ghi log process.StandardError để debug nếu cần:
                return process;
            }
            catch (Exception ex)
            {
                throw new Exception("FFmpeg không thể khởi chạy: " + ex.Message);
            }
        }
    }
}
