// ==UserScript==
// @name         PKU-Thesis-Download 北大论文平台下载工具
// @namespace    https://greasyfork.org/zh-CN/scripts/442310-pku-thesis-download
// @supportURL   https://github.com/xiaotianxt/PKU-Thesis-Download
// @homepageURL  https://github.com/xiaotianxt/PKU-Thesis-Download
// @version      1.2.0
// @description  北大论文平台下载工具，请勿传播下载的文件，否则后果自负。
// @author       xiaotianxt
// @match        http://162.105.134.201/pdfindex*
// @match        https://drm.lib.pku.edu.cn/pdfindex*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pku.edu.cn
// @require      https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js
// @license      GNU GPLv3
// ==/UserScript==

(function () {
  "use strict";
  const OPTIMIZATION = "pku_thesis_download.optimization";
  const fid = $("#fid").val();
  const totalPage = parseInt($("#totalPages").html().replace(/ \/ /, ""));
  const baseUrl = `https://drm.lib.pku.edu.cn/jumpServlet?fid=${fid}`;
  const msgBox = initUI();

  const print = (...args) => console.log("[PKU-Thesis-Download]", ...args);

  if (localStorage.getItem(OPTIMIZATION) === "true" || !localStorage.getItem(OPTIMIZATION)) {
    optimizeImg();
  }

  function initUI() {
    // 下载按钮
    const downloadButton = document.querySelector("#thumbtab").cloneNode(true);
    downloadButton.innerHTML = `
    <div class="panel-bg" style="background: url(&quot;data:image/png;base64,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&quot;) center center no-repeat;"></div>
    <span class="panel-name">下载</span>
    `;
    document.querySelector("#btnList").appendChild(downloadButton);
    downloadButton.addEventListener("click", download);

    // 论文加载优化
    const optimizeImg = document.querySelector("#thumbtab").cloneNode(true);
    optimizeImg.innerHTML = `
    <input type="checkbox" id="optimizeImg" name="optimizeImg" value="true"><label for="optimizeImg">优化加载</label>
    `;
    optimizeImg.querySelector("input").checked = localStorage.getItem(OPTIMIZATION) === "true" || localStorage.getItem(OPTIMIZATION) === null;
    optimizeImg.addEventListener("click", (e) => {
      const checked = e.target.checked;
      localStorage.setItem(OPTIMIZATION, checked);
      if (checked) {
        optimizeImg();
      }
    });

    document.querySelector("#btnList").appendChild(optimizeImg);

    // msgBox
    const msgBox = downloadButton.querySelector("span");
    return msgBox;

  }


  async function download(e) {
    e.preventDefault();
    e.target.disabled = true;
    await solveSrc().then(solveImg).then(solvePDF);
    e.target.disabled = false;
  }

  /**
   * 解析pdf图片链接
   */
  async function solveSrc() {
    async function downloadSrcInfo(url) {
      return fetch(url)
        .then((res) => res.json())
        .then((json) => {
          finished++;
          msgBox.innerHTML = finished + "/" + page;
          return json.list;
        });
    }

    let urlPromise = [];
    let page = 0;
    let finished = 0;
    for (; page < totalPage; page++) {
      const url = baseUrl + "&page=" + page;
      urlPromise.push(downloadSrcInfo(url));
      msgBox.innerHTML = finished + "/" + page;
    }
    return Promise.all(urlPromise);
  }

  /**
   * 下载图片
   */
  async function solveImg(urls) {
    async function downloadPdf(url, i) {
      return fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          return new Promise((resolve) => {
            reader.onloadend = () => {
              resolve(reader.result);
              numFinished++;
              msgBox.innerHTML = numFinished + "/" + numTotal;
            };
          });
        });
    }

    // remove duplicated
    const map = new Map(urls.flat().map((item) => [item.id, item.src]));

    // sort and clear index
    urls = [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map((item) => item[1]);

    // download images
    const base64Promise = [];
    let numFinished = 0;
    let numTotal = 0;
    urls.forEach((url) => {
      base64Promise.push(downloadPdf(url));
      numTotal++;
      msgBox.innerHTML = numFinished + "/" + numTotal;
    });

    return Promise.all(base64Promise);
  }

  /**
   * 拼接为pdf
   * @param {*} base64s
   */
  async function solvePDF(base64s) {
    msgBox.innerHTML = "拼接中";
    const doc = new jspdf.jsPDF();
    base64s.forEach((base64, index) => {
      doc.addImage(base64, "JPEG", 0, 0, 210, 297);
      index + 1 == base64s.length || doc.addPage();
    });
    msgBox.innerHTML = "保存中";
    doc.save(document.title + ".pdf");
    msgBox.innerHTML = "完成！";
  }

  /**
   * 优化加载
   */
  async function optimizeImg() {
    function loadImgForPage(element, observer) {
      const index = Array.from(document.getElementsByClassName('fwr_page_box')).indexOf(element) + 1;
      observer.unobserve(element);

      if (index % 3 !== 1) return;
      print('load image for page', index)
      omg(index + 3); // 提前加载 3 页
    }

    // 创建 IntersectionObserver 实例
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImgForPage(entry.target, observer);
        }
      });
    }, {
      root: document.querySelector('#jspPane'), // 使用 jspPane 作为滚动容器
      rootMargin: '0px',
      threshold: 0 // 当 10% 的内容进入视口时触发
    });

    // 为每个 fwr_page_box 元素设置观察器
    const pages = document.querySelectorAll('.fwr_page_box:nth-child(3n+1)');
    pages.forEach(page => observer.observe(page));
  }
})();
