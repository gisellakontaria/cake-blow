document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  const celebration = document.getElementById("celebration");
  const cardCover = document.getElementById("cardCover");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;
  let celebrating = false;

  // Open card: flip cover, play music, start mic
  cardCover.addEventListener("click", function () {
    cardCover.classList.add("opened");
    const ytDiv = document.getElementById("ytplayer");
    ytDiv.innerHTML = '<iframe src="https://www.youtube.com/embed/o5C0NDDl64w?autoplay=1&loop=1&playlist=o5C0NDDl64w&controls=0" allow="autoplay; encrypted-media" width="1" height="1" frameborder="0"></iframe>';
    initMicrophone();
  });

  // 24 candle positions in 3 rows of 8
  const candlePositions = [
    // Row 1 (back)
    { left: 30, top: 5 }, { left: 57, top: 5 }, { left: 84, top: 5 }, { left: 111, top: 5 },
    { left: 138, top: 5 }, { left: 165, top: 5 }, { left: 192, top: 5 }, { left: 219, top: 5 },
    // Row 2 (middle) — gap in center for the photo stand
    { left: 18, top: 18 }, { left: 45, top: 18 }, { left: 72, top: 18 }, { left: 99, top: 18 },
    { left: 153, top: 18 }, { left: 180, top: 18 }, { left: 207, top: 18 }, { left: 234, top: 18 },
    // Row 3 (front)
    { left: 20, top: 30 }, { left: 47, top: 30 }, { left: 74, top: 30 }, { left: 101, top: 30 },
    { left: 128, top: 30 }, { left: 155, top: 30 }, { left: 182, top: 30 }, { left: 209, top: 30 },
  ];

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;
    if (activeCandles === 0 && !celebrating) {
      celebrating = true;
      triggerCelebration();
    }
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";
    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);
    cake.appendChild(candle);
    candles.push(candle);
  }

  function initCandles() {
    candlePositions.forEach((pos) => addCandle(pos.left, pos.top));
    updateCandleCount();
  }

  function triggerCelebration() {
    celebration.classList.add("show");
    createConfetti();
  }

  function createConfetti() {
    const colors = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff922b", "#cc5de8", "#f06595"];
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.animationDelay = Math.random() * 3 + "s";
      piece.style.animationDuration = Math.random() * 2 + 2 + "s";
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = Math.random() * 8 + 6 + "px";
      piece.style.height = Math.random() * 10 + 8 + "px";
      piece.style.setProperty("--drift", Math.random() * 200 - 100 + "px");
      document.body.appendChild(piece);
    }
  }

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
    return sum / bufferLength > 40;
  }

  function blowOutCandles() {
    if (celebrating) return;
    let blownOut = 0;
    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }
    if (blownOut > 0) updateCandleCount();
  }

  function initMicrophone() {
    if (audioContext) return;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          microphone = audioContext.createMediaStreamSource(stream);
          microphone.connect(analyser);
          analyser.fftSize = 256;
          setInterval(blowOutCandles, 200);
        })
        .catch(function (err) {
          console.log("Unable to access microphone: " + err);
        });
    }
  }

  initCandles();
});
