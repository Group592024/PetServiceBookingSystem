//using System;
//using System.Diagnostics;
//using System.IO;
//using Microsoft.Extensions.Configuration;

//namespace FacilityServiceApi.Infrastructure.Services
//{
//    public class FfmpegService
//    {
//        private readonly string _ffmpegPath;
//        private readonly string _rtspUrl;
//        private readonly string _hlsOutputPath;
//        private readonly int _hlsSegmentTime;
//        private Process _ffmpegProcess;

//        public FfmpegService(IConfiguration configuration)
//        {
//            _ffmpegPath = configuration["CameraConfig:FfmpegPath"];
//            _rtspUrl = configuration["CameraConfig:RtspUrl"];
//            _hlsOutputPath = configuration["CameraConfig:HlsOutputPath"];
//            _hlsSegmentTime = int.Parse(configuration["CameraConfig:HlsSegmentTime"]);
//        }

//        private void CleanHlsDirectory()
//        {
//            if (Directory.Exists(_hlsOutputPath))
//            {
//                var di = new DirectoryInfo(_hlsOutputPath);
//                foreach (var file in di.GetFiles())
//                {
//                    try
//                    {
//                        file.Attributes = FileAttributes.Normal;
//                        file.Delete();
//                    }
//                    catch (Exception ex)
//                    {
//                        Console.WriteLine($"Không thể xóa file {file.FullName}: {ex.Message}");
//                    }
//                }
//                foreach (var dir in di.GetDirectories())
//                {
//                    try
//                    {
//                        dir.Attributes = FileAttributes.Normal;
//                        dir.Delete(true);
//                    }
//                    catch (Exception ex)
//                    {
//                        Console.WriteLine($"Không thể xóa thư mục {dir.FullName}: {ex.Message}");
//                    }
//                }
//            }
//            else
//            {
//                Directory.CreateDirectory(_hlsOutputPath);
//            }
//        }

//        public Process StartFfmpegConversion()
//        {
//            // Dừng tiến trình ffmpeg cũ nếu đang chạy
//            if (_ffmpegProcess != null && !_ffmpegProcess.HasExited)
//            {
//                try
//                {
//                    _ffmpegProcess.Kill();
//                    _ffmpegProcess.Dispose();
//                }
//                catch (Exception ex)
//                {
//                    Console.WriteLine("Lỗi khi dừng tiến trình ffmpeg cũ: " + ex.Message);
//                }
//            }

//            // Làm sạch thư mục HLS trước khi chạy ffmpeg
//            CleanHlsDirectory();

//            string outputFilePath = Path.Combine(_hlsOutputPath, "output.m3u8");
//            // Thêm -y để ghi đè file đầu ra nếu đã tồn tại
//            string arguments = $"-y -i \"{_rtspUrl}\" -c:v copy -c:a aac -f hls -hls_time {_hlsSegmentTime} -hls_list_size 3 -hls_flags delete_segments \"{outputFilePath}\"";

//            var processInfo = new ProcessStartInfo
//            {
//                FileName = _ffmpegPath,
//                Arguments = arguments,
//                RedirectStandardOutput = true,
//                RedirectStandardError = true,
//                UseShellExecute = false,
//                CreateNoWindow = true
//            };

//            _ffmpegProcess = new Process { StartInfo = processInfo };

//            try
//            {
//                _ffmpegProcess.Start();
//                return _ffmpegProcess;
//            }
//            catch (Exception ex)
//            {
//                throw new Exception("FFmpeg không thể khởi chạy: " + ex.Message);
//            }
//        }
//    }
//}
