using System.Diagnostics;
using PSPS.SharedLibrary.Responses;

namespace FacilityServiceApi.Infrastructure.Streams
{
    public class StreamManager
    {
        private readonly Dictionary<Guid, Process> _processes = new();

        public Response StartStream(Guid cameraId, string rtspUrl)
        {
            if (string.IsNullOrWhiteSpace(rtspUrl) || !rtspUrl.StartsWith("rtsp://"))
                return new Response(false, "Invalid RTSP URL");

            try
            {
                if (_processes.ContainsKey(cameraId))
                    return new Response(true, "Stream already running") { Data = GetStreamUrl(cameraId) };

                var outputDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "hls", $"cam_{cameraId}");
                Directory.CreateDirectory(outputDir);

                var outputPath = Path.Combine(outputDir, "stream.m3u8");

                var args = $"-rtsp_transport tcp -i \"{rtspUrl}\" " +
                           "-c:v libx264 -preset veryfast -tune zerolatency " +
                           "-c:a aac -ar 44100 " +
                           "-f hls -hls_time 2 -hls_list_size 3 -hls_flags delete_segments " +
                           $"-loglevel warning \"{outputPath}\"";

                var errorMessages = new List<string>();
                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "ffmpeg",
                        Arguments = args,
                        UseShellExecute = false,
                        RedirectStandardError = true,
                        RedirectStandardOutput = false,
                        CreateNoWindow = true
                    }
                };

                process.ErrorDataReceived += (sender, e) =>
                {
                    if (!string.IsNullOrEmpty(e.Data))
                    {
                        errorMessages.Add(e.Data);
                        Console.WriteLine("[FFmpeg] " + e.Data);
                    }
                };

                if (!process.Start())
                {
                    return new Response(false, "Failed to start FFmpeg process.");
                }

                process.BeginErrorReadLine();

            // Wait up to 30 seconds to see if .ts file appears
var tsGenerated = false;
for (int i = 0; i < 60; i++) // 60 x 0.5s = 30s
{
    var tsFiles = Directory.GetFiles(outputDir, "*.ts");
    if (tsFiles.Any())
    {
        tsGenerated = true;
        break;
    }
    Thread.Sleep(500);
}

                if (!tsGenerated)
                {
                    process.Kill(true);
                    var error = AnalyzeErrorMessages(errorMessages);
                    return new Response(false, error ?? "Your rtspUrl may be incorrect or The device may not in the same network.");
                }

                _processes[cameraId] = process;

                return new Response(true, "Stream started successfully") { Data = GetStreamUrl(cameraId) };
            }
            catch (Exception ex)
            {
                StopStream(cameraId);
                return new Response(false, $"Unexpected error: {ex.Message}");
            }
        }

        public Response StopStream(Guid cameraId)
        {
            try
            {
                if (_processes.TryGetValue(cameraId, out var process))
                {
                    if (!process.HasExited)
                        process.Kill(true);

                    _processes.Remove(cameraId);

                    var path = Path.Combine("wwwroot", "hls", $"cam_{cameraId}");
                    if (Directory.Exists(path))
                        Directory.Delete(path, true);

                    return new Response(true, "Stream stopped successfully");
                }

                return new Response(false, "Stream not found");
            }
            catch (Exception ex)
            {
                return new Response(false, $"Error stopping stream: {ex.Message}");
            }
        }

        public string GetStreamUrl(Guid cameraId)
        {
            return $"http://localhost:5050/hls/cam_{cameraId}/stream.m3u8";
        }

        private string? AnalyzeErrorMessages(List<string> errors)
        {
            if (errors.Any(e => e.Contains("401")))
                return "Unauthorized access. The RTSP stream may require login.";
            if (errors.Any(e => e.Contains("404") || e.Contains("not found", StringComparison.OrdinalIgnoreCase)))
                return "Stream not found (404). Check the RTSP path.";
            if (errors.Any(e => e.Contains("Connection refused") || e.Contains("timed out")))
                return "Unable to connect to the camera. Please check network connectivity.";
            if (errors.Any(e => e.Contains("Could not find codec") || e.Contains("Unknown decoder")))
                return "Unsupported stream format or missing codec.";

            return null; // No known error pattern matched
        }
    }
}
