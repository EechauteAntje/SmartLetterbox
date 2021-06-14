'use strict';
const lanIP = `${window.location.hostname}:5000`;
const socket = io(`http://${lanIP}`);

let htmlPir = ``;
let htmlAccelero = ``;
let htmlLengthPir = ``;
let htmlLengthAccelero = ``;
// let doorData = ``;

// #region ListenToUI and buttons

const listenToUI = function () {
  const button = document.querySelector('.js-btnLetterbox');
  button.addEventListener('click', function () {
    if (document.querySelector('.js-openClosed').innerHTML == `Open Letterbox`) {
      socket.emit('F2B_btn_letterbox', { value: 0 });
      let html = `please open the door of your letterbox`;
      document.querySelector('.js-extra').innerHTML = html;
      //   if (doorData == 0) {
      //     let html = `<svg class="o-layout__item u-1-of-6 u-1-of-8-bp3 c-padding-svg" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="64px" fill="#fff"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
      // <p class=" o-layout__item u-3-of-4 u-4-of-5-bp3 o-layout--justify-end js-openClosed">Close Letterbox</p>`;
      //     button.innerHTML = html;
      //   }
    }
    if (document.querySelector('.js-openClosed').innerHTML == `Close Letterbox`) {
      // socket.emit('F2B_btn_letterbox', { value: 1 });
      let html = `please close the door of your letterbox`;
      document.querySelector('.js-extra').innerHTML = html;
      // if (doorData == 1) {
      //   let html = `<svg class="o-layout__item u-1-of-6 u-1-of-8-bp3 c-padding-svg" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="64px" fill="#fff">
      //   <path d="M0 0h24v24H0z" fill="none" />
      //   <path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z" />
      // </svg>
      // <p class=" o-layout__item u-3-of-4 u-4-of-5-bp3 o-layout--justify-end js-openClosed">Open Letterbox</p>`;
      //   button.innerHTML = html;
      // }
    }
  });
  // });
};

const showButton = function () {
  const button = document.querySelector('.js-btnLetterbox');
  socket.on('B2F_door', function (jsonObject) {
    let doorData = jsonObject.data;
    let doorMagnet = jsonObject.magnet;
    console.log(doorData);
    if (doorData == 1) {
      let html = `<svg class="o-layout__item u-1-of-6 u-1-of-8-bp3 c-padding-svg" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="64px" fill="#fff">
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z" />
        </svg>
        <p class=" o-layout__item u-3-of-4 u-4-of-5-bp3 o-layout--justify-end js-openClosed">Open Letterbox</p>`;
      button.innerHTML = html;
    }
    if (doorData == 0) {
      let html = `<svg class="o-layout__item u-1-of-6 u-1-of-8-bp3 c-padding-svg" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="64px" fill="#fff"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
      <p class=" o-layout__item u-3-of-4 u-4-of-5-bp3 o-layout--justify-end js-openClosed">Close Letterbox</p>`;
      button.innerHTML = html;
    }
    // if (doorData == 0 && doorMagnet == 1) {
    //   let html = `please close the door of your letterbox`;
    //   document.querySelector('.js-extra').innerHTML = html;
    // }
    // if (doorData == 1 && doorMagnet == 0) {
    //   let html = `please open the door of your letterbox`;
    //   document.querySelector('.js-extra').innerHTML = html;
    // }
    if (doorMagnet == 0 && doorData == 0) {
      let html = ``;
      document.querySelector('.js-extra').innerHTML = html;
    }
    if (doorMagnet == 1 && doorData == 1) {
      let html = ``;
      document.querySelector('.js-extra').innerHTML = html;
    }
  });
};

const listenToSubmit = function () {
  const text = document.querySelector('.js-message');
  const submitBtn = document.querySelector('.js-submitBtn');
  submitBtn.addEventListener('click', function () {
    console.log(text.value);
    socket.emit('F2B_message', { text: text.value });
  });
};

const listenToClickfilter = function () {
  for (const btn of document.querySelectorAll('.js-filter')) {
    btn.addEventListener('click', function () {
      let filterid = this.getAttribute('data-filter');
      console.log(filterid);
      getDataAccelero(filterid);
      getDataPir(filterid);
      // if (filterid == `today`) {
      //   console.log('today');
      //   socket.emit('F2B_filter_accelero_today');
      //   socket.emit('F2B_filter_pir_today');
      // }
      // if (filterid == `week`) {
      //   console.log('week');
      //   socket.emit('F2B_filter_accelero_week');
      //   socket.emit('F2B_filter_pir_week');
      // }
      // if (filterid == `month`) {
      //   console.log('month');
      //   socket.emit('F2B_filter_accelero_month');
      //   socket.emit('F2B_filter_pir_month');
      // }
    });
  }
};

const listenToDelete = function () {
  document.querySelector('.js-deletePackages').addEventListener('click', function () {
    socket.emit('F2B_delete', { delete: 'yes' });
    htmlLoad = `<section class="o-row o-row--sm o-row--delivered ">
    <div class="o-container c-white-box">
      <div class="o-section o-section--xl">
        <div class="o-layout o-layout--align-center">
          <div class="o-layout__item">
            <div>
              <p>No packages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </section>`;
    document.querySelector('.js-delivered').innerHTML = htmlLoad;
  });
};

const callbackremove = function (data) {
  console.log('remove');
};
// #endregion

// #region show
const showDataAccelero = function (jsonObject) {
  htmlAccelero = ``;
  if (jsonObject.length == 0) {
    htmlAccelero += `<section class="o-row o-row--sm o-row--delivered ">
        <div class="o-container c-white-box">
          <div class="o-section o-section--xl">
            <div class="o-layout o-layout--align-center">
              <div class="o-layout__item">
                <div>
                  <p>Top wasn't opened</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>`;
    document.querySelector('.js-dataAccelero').innerHTML = htmlAccelero;
  }
  for (let data of jsonObject) {
    if (data.ActionID == 1) {
      if (data.IsDelivered == 1) {
        htmlAccelero += `<section class="o-row o-row--sm o-row--delivered">
          <div class="o-container c-white-box">
            <div class="o-section o-section--xl">
              <div class="o-layout o-layout--gutter o-layout--align-center">
                <div class="o-layout__item u-2-of-3 u-3-of-4-bp3">
                  <p>on ${data.Date} at ${data.Time}</p>
                </div>
                <div class="o-layout o-layout__item u-1-of-3 u-1-of-4-bp3 o-layout--justify-center o-layout--align-end">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <g transform="translate(-312 -224)">
                      <g transform="translate(312 224)">
                        <path d="M0,0H40V40H0Z" fill="none" />
                        <path d="M15.333,31.333v-10H22v10h8.333V18h5L18.667,3,2,18H7V31.333Z" transform="translate(1.333 2)" fill="#152ed6" />
                      </g>
                      <g transform="translate(337 247)" fill="#fff" stroke="#fff" stroke-width="1">
                        <ellipse cx="7" cy="6.5" rx="7" ry="6.5" stroke="none" />
                        <ellipse cx="7" cy="6.5" rx="6.5" ry="6" fill="none" />
                      </g>
                      <g transform="translate(335.333 245.667)">
                        <path d="M0,0H16.667V16.667H0ZM0,0H16.667V16.667H0Z" fill="none" />
                        <path d="M12.132,5.875,7.556,10.451,5.062,7.965l-.979.979,3.472,3.472,5.556-5.556ZM8.944,2a6.944,6.944,0,1,0,6.944,6.944A6.947,6.947,0,0,0,8.944,2Zm0,12.5A5.556,5.556,0,1,1,14.5,8.944,5.554,5.554,0,0,1,8.944,14.5Z" transform="translate(-0.611 -0.611)" fill="#152ed6" />
                      </g>
                    </g>
                  </svg>
                  <p class="u-font-size-label c-label-with-delivery">with delivery</p>
                </div>
              </div>
            </div>
          </div>
        </section>`;
      } else {
        htmlAccelero += `
      <section class="o-row o-row--sm o-row--delivered">
  <div class="o-container c-white-box">
    <div class="o-section o-section--xl">
      <div class="o-layout o-layout--gutter o-layout--align-center">
        <div class="o-layout__item u-1-of-2-bp3">
          <p>on ${data.Date} at ${data.Time}</p>
        </div>
      </div>
    </div>
  </div>
</section>`;
      }

      document.querySelector('.js-dataAccelero').innerHTML = htmlAccelero;
    }
  }
  if (jsonObject.length > 0) {
    if (jsonObject.length > 1) {
      htmlLengthAccelero = `<section class="o-row o-row--sm o-row--delivered">
    <div class="o-container ">
      <div class="o-section o-section--xl">
        <div class="o-layout o-layout--gutter o-layout--align-center">
          <div class="o-layout__item u-1-of-2-bp3">
            <p>${jsonObject.length} people opened your letterbox</p>
          </div>
        </div>
      </div>
    </div>
  </section>`;
      document.querySelector('.js-amount-accelero').innerHTML = htmlLengthAccelero;
    }
    if (jsonObject.length == 1) {
      let htmlLengthAccelero = `<section class="o-row o-row--sm o-row--delivered">
    <div class="o-container ">
      <div class="o-section o-section--xl">
        <div class="o-layout o-layout--gutter o-layout--align-center">
          <div class="o-layout__item u-1-of-2-bp3">
            <p>${jsonObject.length} person opened your letterbox</p>
          </div>
        </div>
      </div>
    </div>
  </section>`;
      document.querySelector('.js-amount-accelero').innerHTML = htmlLengthAccelero;
    }
  }
};

const showDataPir = function (jsonObject) {
  console.log(jsonObject);
  console.log(jsonObject.length);
  htmlPir = ``;
  if (jsonObject.length == 0) {
    htmlPir += `<section class="o-row o-row--sm o-row--delivered ">
    <div class="o-container c-white-box">
      <div class="o-section o-section--xl">
        <div class="o-layout o-layout--align-center">
          <div class="o-layout__item">
            <div>
              <p>No movement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </section>`;
    document.querySelector('.js-dataPir').innerHTML = htmlPir;
  }
  for (let data of jsonObject) {
    if (data.ActionID == 5) {
      // console.log(data);
      // if (object.Date == Date.now()) {
      if (data.IsDelivered == 1) {
        htmlPir += `<section class="o-row o-row--sm o-row--delivered">
          <div class="o-container c-white-box">
            <div class="o-section o-section--xl">
              <div class="o-layout o-layout--gutter o-layout--align-center">
                <div class="o-layout__item u-2-of-3 u-3-of-4-bp3">
                  <p>on ${data.Date} at ${data.Time}</p>
                </div>
                <div class="o-layout o-layout__item u-1-of-3 u-1-of-4-bp3 o-layout--justify-center o-layout--align-end">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <g transform="translate(-312 -224)">
                      <g transform="translate(312 224)">
                        <path d="M0,0H40V40H0Z" fill="none" />
                        <path d="M15.333,31.333v-10H22v10h8.333V18h5L18.667,3,2,18H7V31.333Z" transform="translate(1.333 2)" fill="#152ed6" />
                      </g>
                      <g transform="translate(337 247)" fill="#fff" stroke="#fff" stroke-width="1">
                        <ellipse cx="7" cy="6.5" rx="7" ry="6.5" stroke="none" />
                        <ellipse cx="7" cy="6.5" rx="6.5" ry="6" fill="none" />
                      </g>
                      <g transform="translate(335.333 245.667)">
                        <path d="M0,0H16.667V16.667H0ZM0,0H16.667V16.667H0Z" fill="none" />
                        <path d="M12.132,5.875,7.556,10.451,5.062,7.965l-.979.979,3.472,3.472,5.556-5.556ZM8.944,2a6.944,6.944,0,1,0,6.944,6.944A6.947,6.947,0,0,0,8.944,2Zm0,12.5A5.556,5.556,0,1,1,14.5,8.944,5.554,5.554,0,0,1,8.944,14.5Z" transform="translate(-0.611 -0.611)" fill="#152ed6" />
                      </g>
                    </g>
                  </svg>
                  <p class="u-font-size-label c-label-with-delivery">with delivery</p>
                </div>
              </div>
            </div>
          </div>
        </section>`;
      } else {
        htmlPir += `
      <section class="o-row o-row--sm o-row--delivered">
  <div class="o-container c-white-box">
    <div class="o-section o-section--xl">
      <div class="o-layout o-layout--gutter o-layout--align-center">
        <div class="o-layout__item u-1-of-2-bp3">
          <p>on ${data.Date} at ${data.Time}</p>
        </div>
      </div>
    </div>
  </div>
</section>`;
      }
      // }
      document.querySelector('.js-dataPir').innerHTML = htmlPir;
    }
  }
  if (jsonObject.length > 0) {
    if (jsonObject.length > 1) {
      let htmlLengthPir = `<section class="o-row o-row--sm o-row--delivered">
    <div class="o-container ">
      <div class="o-section o-section--xl">
        <div class="o-layout o-layout--gutter o-layout--align-center">
          <div class="o-layout__item u-1-of-2-bp3">
            <p>${jsonObject.length} people passed your letterbox</p>
          </div>
        </div>
      </div>
    </div>
  </section>`;
      document.querySelector('.js-amount-pir').innerHTML = htmlLengthPir;
    }
    if (jsonObject.length == 1) {
      let htmlLengthPir = `<section class="o-row o-row--sm o-row--delivered">
    <div class="o-container ">
      <div class="o-section o-section--xl">
        <div class="o-layout o-layout--gutter o-layout--align-center">
          <div class="o-layout__item u-1-of-2-bp3">
            <p>${jsonObject.length} person passed your letterbox</p>
          </div>
        </div>
      </div>
    </div>
  </section>`;
      document.querySelector('.js-amount-pir').innerHTML = htmlLengthPir;
    }
  }
};
// #endregion

// #region getData
const getDataAccelero = function (id) {
  console.log(id);
  handleData(`http://${lanIP}/api/v1/dataAccelero/${id}`, showDataAccelero);
};

const getDataPir = function (id) {
  console.log(id);
  handleData(`http://${lanIP}/api/v1/dataPir/${id}`, showDataPir);
};

// #endregion

// #region ListenSocket
const listenToSocket = function () {
  socket.on('connect', function () {
    console.log('verbonden met socket webserver');
    // socket.emit('F2B_btn_letterbox', { value: 0 });
    // socket.emit('F2B_filter_pir_today');
    // socket.emit('F2B_filter_accelero_today');
  });

  if (document.querySelector('.js-messagepage')) {
    socket.on('B2F_messageLCD', function (jsonObject) {
      console.log(jsonObject.message);
      console.log('test');
      document.querySelector('.js-message').value = jsonObject.message;
    });
  }

  if (document.querySelector('.js-dataAccelero')) {
    socket.on('B2F_dataAccelero', function (jsonObject) {
      console.log(jsonObject);
      if (
        htmlAccelero ==
        `<section class="o-row o-row--sm o-row--delivered ">
      <div class="o-container c-white-box">
        <div class="o-section o-section--xl">
          <div class="o-layout o-layout--align-center">
            <div class="o-layout__item">
              <div>
                <p>Top wasn't opened</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>`
      ) {
        htmlAccelero = ``;
      }
      if (jsonObject.lengthData == 0) {
        htmlAccelero = `<section class="o-row o-row--sm o-row--delivered ">
        <div class="o-container c-white-box">
          <div class="o-section o-section--xl">
            <div class="o-layout o-layout--align-center">
              <div class="o-layout__item">
                <div>
                  <p>Top wasn't opened</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>`;
        document.querySelector('.js-dataAccelero').innerHTML = html;
      }
      // for (let data of jsonObject) {}
      if (jsonObject.ActionID == 1) {
        if (jsonObject.IsDelivered == 1) {
          htmlAccelero += `<section class="o-row o-row--sm o-row--delivered">
              <div class="o-container c-white-box">
                <div class="o-section o-section--xl">
                  <div class="o-layout o-layout--align-center">
                    <div class="o-layout__item u-3-of-4 u-3-of-4-bp3">
                      <p>on ${jsonObject.Date} at ${jsonObject.Time}</p>
                    </div>
                    <div class="o-layout o-layout__item u-1-of-4 u-1-of-4-bp3 o-layout--justify-center o-layout--align-end" style='padding-right: 10px;'>
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                        <g transform="translate(-312 -224)">
                          <g transform="translate(312 224)">
                            <path d="M0,0H40V40H0Z" fill="none" />
                            <path d="M15.333,31.333v-10H22v10h8.333V18h5L18.667,3,2,18H7V31.333Z" transform="translate(1.333 2)" fill="#152ed6" />
                          </g>
                          <g transform="translate(337 247)" fill="#fff" stroke="#fff" stroke-width="1">
                            <ellipse cx="7" cy="6.5" rx="7" ry="6.5" stroke="none" />
                            <ellipse cx="7" cy="6.5" rx="6.5" ry="6" fill="none" />
                          </g>
                          <g transform="translate(335.333 245.667)">
                            <path d="M0,0H16.667V16.667H0ZM0,0H16.667V16.667H0Z" fill="none" />
                            <path d="M12.132,5.875,7.556,10.451,5.062,7.965l-.979.979,3.472,3.472,5.556-5.556ZM8.944,2a6.944,6.944,0,1,0,6.944,6.944A6.947,6.947,0,0,0,8.944,2Zm0,12.5A5.556,5.556,0,1,1,14.5,8.944,5.554,5.554,0,0,1,8.944,14.5Z" transform="translate(-0.611 -0.611)" fill="#152ed6" />
                          </g>
                        </g>
                      </svg>
                      <p class="u-font-size-label c-label-with-delivery">with delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>`;
        } else {
          htmlAccelero += `
          <section class="o-row o-row--sm o-row--delivered">
      <div class="o-container c-white-box">
        <div class="o-section o-section--xl">
          <div class="o-layout o-layout--gutter o-layout--align-center">
            <div class="o-layout__item u-1-of-2-bp3">
              <p>on ${jsonObject.Date} at ${jsonObject.Time}</p>
            </div>
          </div>
        </div>
      </div>
    </section>`;
        }

        document.querySelector('.js-dataAccelero').innerHTML = htmlAccelero;
      }

      if (jsonObject.lengthData > 0) {
        if (jsonObject.lengthData > 1) {
          let htmlLengthAccelero = `<section class="o-row o-row--sm o-row--delivered">
        <div class="o-container ">
          <div class="o-section o-section--xl">
            <div class="o-layout o-layout--gutter o-layout--align-center">
              <div class="o-layout__item u-1-of-2-bp3">
                <p>${jsonObject.lengthData} people opened your letterbox</p>
              </div>
            </div>
          </div>
        </div>
      </section>`;
          document.querySelector('.js-amount-accelero').innerHTML = htmlLengthAccelero;
        }
        if (jsonObject.lengthData == 1) {
          let htmlLengthAccelero = `<section class="o-row o-row--sm o-row--delivered">
        <div class="o-container ">
          <div class="o-section o-section--xl">
            <div class="o-layout o-layout--gutter o-layout--align-center">
              <div class="o-layout__item u-1-of-2-bp3">
                <p>${jsonObject.lengthData} person opened your letterbox</p>
              </div>
            </div>
          </div>
        </div>
      </section>`;
          document.querySelector('.js-amount-accelero').innerHTML = htmlLengthAccelero;
        }
      }
    });
  }

  if (document.querySelector('.js-dataPir')) {
    socket.on('B2F_dataPir', function (jsonObject) {
      console.log(jsonObject);
      console.log(jsonObject.lengthData);
      if (
        htmlPir ==
        `<section class="o-row o-row--sm o-row--delivered ">
      <div class="o-container c-white-box">
        <div class="o-section o-section--xl">
          <div class="o-layout o-layout--align-center">
            <div class="o-layout__item">
              <div>
                <p>No movement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>`
      ) {
        htmlPir = ``;
      }
      if (jsonObject.lengthData == 0) {
        htmlPir = `<section class="o-row o-row--sm o-row--delivered ">
        <div class="o-container c-white-box">
          <div class="o-section o-section--xl">
            <div class="o-layout o-layout--align-center">
              <div class="o-layout__item">
                <div>
                  <p>No movement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>`;
        document.querySelector('.js-dataPir').innerHTML = htmlPir;
      }
      // for(let data in jsonobject){}
      if (jsonObject.ActionID == 5) {
        // console.log(jsonObject);
        // if (object.Date == Date.now()) {
        if (jsonObject.IsDelivered == 1) {
          htmlPir += `<section class="o-row o-row--sm o-row--delivered">
              <div class="o-container c-white-box">
                <div class="o-section o-section--xl">
                  <div class="o-layout o-layout--align-center">
                    <div class="o-layout__item u-3-of-4 u-3-of-4-bp3">
                      <p>on ${jsonObject.Date} at ${jsonObject.Time}</p>
                    </div>
                    <div class="o-layout o-layout__item u-1-of-4 u-1-of-4-bp3 o-layout--justify-center o-layout--align-end" style='padding-right: 10px;>
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                        <g transform="translate(-312 -224)">
                          <g transform="translate(312 224)">
                            <path d="M0,0H40V40H0Z" fill="none" />
                            <path d="M15.333,31.333v-10H22v10h8.333V18h5L18.667,3,2,18H7V31.333Z" transform="translate(1.333 2)" fill="#152ed6" />
                          </g>
                          <g transform="translate(337 247)" fill="#fff" stroke="#fff" stroke-width="1">
                            <ellipse cx="7" cy="6.5" rx="7" ry="6.5" stroke="none" />
                            <ellipse cx="7" cy="6.5" rx="6.5" ry="6" fill="none" />
                          </g>
                          <g transform="translate(335.333 245.667)">
                            <path d="M0,0H16.667V16.667H0ZM0,0H16.667V16.667H0Z" fill="none" />
                            <path d="M12.132,5.875,7.556,10.451,5.062,7.965l-.979.979,3.472,3.472,5.556-5.556ZM8.944,2a6.944,6.944,0,1,0,6.944,6.944A6.947,6.947,0,0,0,8.944,2Zm0,12.5A5.556,5.556,0,1,1,14.5,8.944,5.554,5.554,0,0,1,8.944,14.5Z" transform="translate(-0.611 -0.611)" fill="#152ed6" />
                          </g>
                        </g>
                      </svg>
                      <p class="u-font-size-label c-label-with-delivery">with delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>`;
        } else {
          htmlPir += `
          <section class="o-row o-row--sm o-row--delivered">
      <div class="o-container c-white-box">
        <div class="o-section o-section--xl">
          <div class="o-layout o-layout--gutter o-layout--align-center">
            <div class="o-layout__item u-1-of-2-bp3">
              <p>on ${jsonObject.Date} at ${jsonObject.Time}</p>
            </div>
          </div>
        </div>
      </div>
    </section>`;
        }
        // }
        document.querySelector('.js-dataPir').innerHTML = htmlPir;
      }

      if (jsonObject.lengthData > 0) {
        if (jsonObject.lengthData > 1) {
          let htmlLengthPir = `<section class="o-row o-row--sm o-row--delivered">
        <div class="o-container ">
          <div class="o-section o-section--xl">
            <div class="o-layout o-layout--gutter o-layout--align-center">
              <div class="o-layout__item u-1-of-2-bp3">
                <p>${jsonObject.lengthData} people passed your letterbox</p>
              </div>
            </div>
          </div>
        </div>
      </section>`;
          document.querySelector('.js-amount-pir').innerHTML = htmlLengthPir;
        }
        if (jsonObject.lengthData == 1) {
          let htmlLengthPir = `<section class="o-row o-row--sm o-row--delivered">
        <div class="o-container ">
          <div class="o-section o-section--xl">
            <div class="o-layout o-layout--gutter o-layout--align-center">
              <div class="o-layout__item u-1-of-2-bp3">
                <p>${jsonObject.lengthData} person passed your letterbox</p>
              </div>
            </div>
          </div>
        </div>
      </section>`;
          document.querySelector('.js-amount-pir').innerHTML = htmlLengthPir;
        }
      }
    });
  }
  if (document.querySelector('.js-packages')) {
    socket.on('B2F_weight', function (jsonObject) {
      // console.log(jsonObject);
      let html = ``;
      if (jsonObject.length == 0) {
        html = `<section class="o-row o-row--sm o-row--delivered ">
        <div class="o-container c-white-box">
          <div class="o-section o-section--xl">
            <div class="o-layout o-layout--align-center">
              <div class="o-layout__item">
                <div>
                  <p>No packages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>`;
        document.querySelector('.js-delivered').innerHTML = html;
      }
      for (let data of jsonObject) {
        if (data.ActionID == 3) {
          html += `
                
          <section class="o-row o-row--sm o-row--delivered ">
      <div class="o-container c-white-box">
        <div class="o-section o-section--xl">
          <div class="o-layout o-layout--align-center">
            <div class="o-layout__item u-1-of-4 u-1-of-8-bp1">
              <svg style="padding-top:10px;" xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 40">
                <g transform="translate(-312 -224)">
                  <g transform="translate(312 224)">
                    <path d="M0,0H40V40H0Z" fill="none" />
                    <path d="M15.333,31.333v-10H22v10h8.333V18h5L18.667,3,2,18H7V31.333Z" transform="translate(1.333 2)" fill="#152ed6" />
                  </g>
                  <g transform="translate(337 247)" fill="#fff" stroke="#fff" stroke-width="1">
                    <ellipse cx="7" cy="6.5" rx="7" ry="6.5" stroke="none" />
                    <ellipse cx="7" cy="6.5" rx="6.5" ry="6" fill="none" />
                  </g>
                  <g transform="translate(335.333 245.667)">
                    <path d="M0,0H16.667V16.667H0ZM0,0H16.667V16.667H0Z" fill="none" />
                    <path d="M12.132,5.875,7.556,10.451,5.062,7.965l-.979.979,3.472,3.472,5.556-5.556ZM8.944,2a6.944,6.944,0,1,0,6.944,6.944A6.947,6.947,0,0,0,8.944,2Zm0,12.5A5.556,5.556,0,1,1,14.5,8.944,5.554,5.554,0,0,1,8.944,14.5Z" transform="translate(-0.611 -0.611)" fill="#152ed6" />
                  </g>
                </g>
              </svg>
            </div>
            <div class="o-layout__item u-3-of-5">
              <div>
                <h2>Delivered</h2>
                <p>${data.Date} at ${data.Time} </p>
                
              </div>
            </div>
            <!-- <p class="js-accelero">deksel geopend</p>
              <p class="js-pir">pir sensor</p> -->
          </div>
        </div>
      </div>
      </section>
    
        `;
        }
        document.querySelector('.js-delivered').innerHTML = html;
      }
    });
  }
  // warning
  if (document.querySelector('.js-index')) {
    socket.on('B2F_warning', function (jsonObject) {
      console.log(`warning length: ${jsonObject.length}`);
      if (jsonObject.length > 20) {
        let html = `<section class="o-row">
      <div class="o-container">
        <div class="o-section o-section--xl c-warning">
          <div class="o-layout">
            <div class="o-layout__item u-1-of-4">
              <svg class="c-paddig-warning" xmlns="http://www.w3.org/2000/svg" height="80px" viewBox="0 0 24 24" width="56px" fill="#000000">
                <path d="M0 0h24v24H0z" fill="none" />
                <circle cx="12" cy="19" r="2" />
                <path d="M10 3h4v12h-4z" />
              </svg>
            </div>
            <div class="o-layout__item u-3-of-4 c-padding-warningtext">
              <p>Watch out there was a lot of unnecessary movement arround your letterbox. <a class="c-nav__link-details" href="analyses.html">details</a></p>
            </div>
          </div>
        </div>
      </div>
    </section>`;
        document.querySelector('.js-warning').innerHTML = html;
      }
    });
    // socket.on('B2F_door', function (jsonObject) {
    //   const button = document.querySelector('.js-btnLetterbox');
    //   if (jsonObject.data == 1) {
    //     let html = `<svg class="o-layout__item u-1-of-6 u-1-of-8-bp3 c-padding-svg" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="64px" fill="#fff"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
    //   <p class=" o-layout__item u-3-of-4 u-4-of-5-bp3 o-layout--justify-end js-openClosed">Close Letterbox</p>`;
    //     button.innerHTML = html;
    //   }
    //   if (jsonObject.data == 0) {
    //     let html = `<svg class="o-layout__item u-1-of-6 u-1-of-8-bp3 c-padding-svg" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="64px" fill="#fff"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
    //   <p class=" o-layout__item u-3-of-4 u-4-of-5-bp3 o-layout--justify-end js-openClosed">Close Letterbox</p>`;
    //     button.innerHTML = html;
    //   }
    // });
  }
};

// #endregion

function toggleNav() {
  let toggleTrigger = document.querySelectorAll('.js-toggle-nav');
  for (let i = 0; i < toggleTrigger.length; i++) {
    toggleTrigger[i].addEventListener('click', function () {
      console.log('ei');
      document.querySelector('body').classList.toggle('has-mobile-nav');
    });
  }
}

// #region DOM

document.addEventListener('DOMContentLoaded', function () {
  console.info('DOM geladen');
  listenToSocket();
  toggleNav();

  if (document.querySelector('.js-index')) {
    listenToUI();
    listenToDelete();
    showButton();
  }

  if (document.querySelector('.js-messagepage')) {
    listenToSubmit();
  }

  if (document.querySelector('.js-info')) {
    console.log('info');
    listenToClickfilter();
    getDataAccelero('today');
    getDataPir('today');
  }
});

// #endregion

// if (document.querySelector('.js-accelero')) {
//   socket.on('B2F_accelero', function (jsonObject) {
//     console.log(jsonObject);
//     if (jsonObject.value > 0.8) {
//       console.log('deksel gesloten');
//       let html = `deksel gesloten`;
//       document.querySelector('.js-accelero').innerHTML = html;
//     }
//     if (jsonObject.value <= 0.8) {
//       console.log('deksel open');
//       let html = `deksel open`;
//       document.querySelector('.js-accelero').innerHTML = html;
//     }
//   });
// }
