console.log("Testing JavaScript");

document.addEventListener('DOMContentLoaded', (event) => {
  console.log("DOM fully loaded and parsed");

  var app = document.getElementById('app');
  var typewriter = new Typewriter(app, {
    loop: true,
    delay: 45,
  });

  typewriter
    .pauseFor(1000)
    .typeString('I am interested in the convergence of Data Science, ML, and Business -- leveraging insights to drive strategic decisions.')
    .pauseFor(3000)
    .start();

  var granimInstance = new Granim({
    element: '#canvas-image-blending',
    direction: 'top-bottom',
    isPausedWhenNotInView: true,
    states : {
      "default-state": {
        gradients: [
          ['#29323c', '#485563'],
          ['#FF6B6B', '#556270'],
          ['#80d3fe', '#7ea0c4'],
          ['#f0ab51', '#eceba3']
        ],
        transitionSpeed: 10000
      }
    }
  });

  var resumeModal = document.getElementById("resumeModal");
  var resumeBtn = document.getElementById("resumeBtn");
  console.log("resumeBtn:", resumeBtn);

  if (resumeBtn && resumeModal) {
    resumeBtn.onclick = function() {
      resumeModal.style.display = "block";
    }

    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
      resumeModal.style.display = "none";
    }

    window.onclick = function(event) {
      if (event.target == resumeModal) {
        resumeModal.style.display = "none";
      }
    }
  } else {
    console.error("Elements not found");
  }
});
