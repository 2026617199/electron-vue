<template>
  <div>
    <el-button @click="startRecording">start</el-button>
    <el-button @click="stopRecording">end</el-button>
  </div>
</template>
<script setup lang='ts'>
let mediaRecorder: MediaRecorder

let chunks: any[] = [];
let stream: MediaStream

const startRecording = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  console.log('devices: ', devices);
  const audioL = devices.filter((i) => i.kind === "audioinput");
  const videoL = devices.filter((i) => i.kind === "videoinput");

  // 超清：3840x2160分辨率
  // 高清：1280x720分辨率
  // 标清：720x480分辨率
  stream = await navigator.mediaDevices.getDisplayMedia({
    video: { width: 3840, height: 2160 },
    audio: true
  });

  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=h264")
  ? "video/webm;codecs=h264"
  : "video/webm";

  mediaRecorder = new MediaRecorder(stream, {
    // mimeType: mime,
    mimeType: 'video/webm; codecs=vp9',
    videoBitsPerSecond: 5000000
  });
  mediaRecorder.addEventListener("dataavailable", function (e) {
    chunks.push(e.data);
  });

  mediaRecorder.addEventListener("stop", () => {
    const blob = new Blob(chunks, { type: chunks[0].type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video.webm";
    a.click();
  });
  mediaRecorder.start();
};


const stopRecording = () => {
  if (mediaRecorder) {
    // mediaRecorder.onstop = () => {
    //   const blob = new Blob(chunks, { type: 'video/webm' });
    //   const url = URL.createObjectURL(blob);
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.download = 'screen_recording.webm';
    //   link.click();
    //   URL.revokeObjectURL(url);
    //   chunks = []; // 清空数据块，以便下次录制
    //   stream.getTracks().forEach((track) => track.stop()); // 停止并释放流资源
    //   console.log('录制结束，视频已保存');
    // };
    mediaRecorder.stop(); // 停止录制
  } else {
    console.log('未开始录制');
  }
};

onMounted(() => {
})


const handleDataAvailable = (e: any) => {
  chunks.push(e.data);
}
</script>


<style scoped>

</style>
