!function(e){var t={};function n(i){if(t[i])return t[i].exports;var s=t[i]={i:i,l:!1,exports:{}};return e[i].call(s.exports,s,s.exports,n),s.l=!0,s.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)n.d(i,s,function(t){return e[t]}.bind(null,s));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=5)}({5:function(e,t,n){"use strict";n.r(t);var i,s=function(){function e(){this.length=0,this.events={}}return e.prototype.on=function(e,t){var n=this;return this.events[e]||(this.events[e]=[]),this.events[e].push(t),this.length++,function(){return n.off(e,t)}},e.prototype.off=function(e,t){this.events[e]=this.events[e].filter(function(e){return t!==e}),this.length--},e.prototype.trigger=function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];var i=this.events[e];i&&i.forEach(function(e){return e.apply(void 0,t)})},e}();!function(e){e[e.UP=38]="UP",e[e.DOWN=40]="DOWN",e[e.ENTER=13]="ENTER",e[e.ESC=27]="ESC"}(i||(i={}));n(73);n.d(t,"PureSuggest",function(){return o});var u=function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])};return function(t,n){function i(){this.constructor=t}e(t,n),t.prototype=null===n?Object.create(n):(i.prototype=n.prototype,new i)}}(),l=250,o=function(e){function t(t,n){var i=e.call(this)||this;if(i.focused=!1,i.index=0,i.value=[],!n||!n.createSource)throw new Error("createSource is required");return i.el=t,i.input=i.el.querySelector(".suggest__input"),i.suggestSource=n.createSource(n.initialData),i.options=n,i.handleSelfClick=i.handleSelfClick.bind(i),i.handleKeyDown=i.handleKeyDown.bind(i),i.handleFocus=i.handleFocus.bind(i),i.handleBlur=i.handleBlur.bind(i),i.doImmSearch=i.doSearch.bind(i),i.doSearch=function(e,t){var n;return function(){for(var i=[],s=0;s<arguments.length;s++)i[s]=arguments[s];clearTimeout(n),n=setTimeout(function(){return e.apply(void 0,i)},t)}}(i.doImmSearch,l),i.handleItemClick=i.handleItemClick.bind(i),i.handleItemMove=i.handleItemMove.bind(i),i.handleBubbleClose=i.handleBubbleClose.bind(i),i.handleBubbleClose=i.handleBubbleClose.bind(i),i.el.addEventListener("click",i.handleSelfClick),i.input.addEventListener("keydown",i.handleKeyDown),i.input.addEventListener("input",i.doSearch),i.input.addEventListener("focus",i.handleFocus),i.input.addEventListener("blur",i.handleBlur),i}return u(t,e),t.prototype.handleSelfClick=function(){this.options.multi&&(this.input.style.display=""),this.input.focus()},t.prototype.handleKeyDown=function(e){var t=e.which||e.keyCode;if(t===i.UP)this.handleUp();else if(t===i.DOWN)this.handleDown();else if(t===i.ENTER)this.handleSelect();else{if(t!==i.ESC)return;this.handleEsc()}e.preventDefault()},t.prototype.handleFocus=function(){this.focused=!0,this.el.classList.add("suggest_focused"),this.options.multi&&this.addEl&&(this.addEl.style.display="none"),this.doImmSearch(),this.trigger("focus")},t.prototype.handleBlur=function(){this.focused=!1,this.el.classList.remove("suggest_focused"),this.options.multi&&(this.value.length?this.input.style.display="none":this.input.style.display="",this.addEl&&(this.addEl.style.display="")),this.menuEl&&(this.menuEl.style.display="none"),this.trigger("blur")},t.prototype.handleUp=function(){!this.menuItems||this.index<=0||!this.focused||this.updateHovered(this.index-1)},t.prototype.handleDown=function(){!this.menuItems||this.index>=this.menuItems.length-1||!this.focused||this.updateHovered(this.index+1)},t.prototype.handleSelect=function(){if(this.menuItems){var e=this.menuItems[this.index].getAttribute("data-id");this.setValue(e),this.input.blur()}},t.prototype.handleEsc=function(){this.input.blur()},t.prototype.getInputValue=function(){return this.input.value.trim()},t.prototype.setValue=function(e){var t=this.suggestItems[this.index];this.index=0,this.options.multi?(this.input.value="",this.value.push(t),this.addBubble(t)):(this.input.value=t.title,this.value=[t],this.trigger("change",e))},t.prototype.doSearch=function(){var e=this;this.suggestSource.search(this.getInputValue(),this.options.multi?this.value:[]).then(function(t){return e.updateMenu(t)})},t.prototype.handleItemClick=function(e){var t=this.findDataItem(e.target);if(t){var n=t.getAttribute("data-id");this.updateHovered(this.menuItems.indexOf(t)),this.setValue(n)}},t.prototype.handleItemMove=function(e){var t=this.findDataItem(e.target);t&&this.updateHovered(this.menuItems.indexOf(t))},t.prototype.handleBubbleClose=function(e){var t=e.target;if(e.stopPropagation(),"suggest-bubble__close"===t.className){var n=this.findDataItem(e.target);n&&this.removeBubble(n)}},t.prototype.handleBubbleClick=function(e){e.stopPropagation()},t.prototype.findDataItem=function(e){var t=e,n=function(){return t&&t.getAttribute&&t.getAttribute("data-id")};if(n())return t;for(;t.parentNode;)if(t=t.parentNode,n())return t},t.prototype.updateHovered=function(e){this.menuItems[this.index].classList.remove("suggest-item_hovered"),this.index=e,this.menuItems[this.index].classList.add("suggest-item_hovered")},t.prototype.updateMenu=function(e){var t=this,n=this.getInputValue();if(this.menuItems=[],this.suggestItems=e,this.menuEl?(this.menuEl.innerHTML="",this.menuEl.style.display=""):(this.menuWrapEl=document.createElement("div"),this.menuEl=document.createElement("div"),this.menuWrapEl.className="suggest__menu-wrap",this.menuEl.className="suggest__menu",this.el.appendChild(this.menuWrapEl),this.menuWrapEl.appendChild(this.menuEl),this.menuEl.addEventListener("mousedown",this.handleItemClick),this.menuEl.addEventListener("mousemove",this.handleItemMove)),e.length){var i=document.createDocumentFragment();this.index=0,e.forEach(function(e){return t.createMenuItem(e,i,n)}),this.menuEl.appendChild(i),this.updateHovered(this.index)}else{var s=document.createElement("div");s.className="suggest__not-found",s.textContent="User not found",this.menuEl.appendChild(s)}},t.prototype.createMenuItem=function(e,t,n){var i=document.createElement("div"),s=document.createElement("div"),u=document.createElement("div"),l=this.suggestSource.highlight(e.title,n);if(!this.options.hideAvatar){var o=document.createElement("div"),r=document.createElement("img");r.setAttribute("src",e.image),r.setAttribute("alt",e.title),o.className="suggest-item__image",o.appendChild(r),i.appendChild(o)}i.className="suggest-item",s.className="suggest-item__title",u.className="suggest-item__subtitle",l.length<=1?s.textContent=e.title:this.createHighlight(s,l),u.textContent=e.subtitle,i.appendChild(s),i.appendChild(u),i.setAttribute("data-id",String(e.id)),t.appendChild(i),this.menuItems.push(i)},t.prototype.createHighlight=function(e,t){if(t[1]&&t[1].trim()){var n=document.createTextNode(t[0]),i=document.createElement("span");if(i.textContent=t[1],e.appendChild(n),e.appendChild(i),t[2]){var s=document.createTextNode(t[2]);e.appendChild(s)}}else e.textContent=t[0]},t.prototype.addBubble=function(e){this.bubblesEl||(this.bubblesEl=document.createElement("div"),this.addEl=document.createElement("div"),this.bubblesEl.className="suggest__bubbles",this.addEl.className="suggest__add",this.addEl.textContent="Add",this.el.insertBefore(this.bubblesEl,this.input),this.el.insertBefore(this.addEl,this.input),this.bubblesEl.addEventListener("mousedown",this.handleBubbleClose),this.bubblesEl.addEventListener("click",this.handleBubbleClick));var t=document.createElement("div"),n=document.createElement("div"),i=document.createElement("div");t.className="suggest-bubble",n.className="suggest-bubble__text",i.className="suggest-bubble__close",t.setAttribute("data-id",e.id),n.textContent=e.title,t.appendChild(n),t.appendChild(i),this.bubblesEl.appendChild(t),this.el.classList.add("suggest_filled"),this.trigger("change",this.value.map(function(e){return e.id}))},t.prototype.removeBubble=function(e){var t=e.getAttribute("data-id");t&&(this.bubblesEl.removeChild(e),this.value=this.value.filter(function(e){return e.id!==t}),this.value.length||(this.el.classList.remove("suggest_filled"),this.input.style.display=""),this.trigger("change",this.value.map(function(e){return e.id})))},t.prototype.destroy=function(){this.suggestSource=null,this.options=null,this.el.removeEventListener("click",this.handleSelfClick),this.input.removeEventListener("keydown",this.handleKeyDown),this.input.removeEventListener("input",this.doSearch),this.input.removeEventListener("focus",this.handleFocus),this.input.removeEventListener("blur",this.handleBlur),this.menuEl&&(this.menuEl.removeEventListener("mousedown",this.handleItemClick),this.menuEl.removeEventListener("mousemove",this.handleItemMove)),this.bubblesEl&&(this.bubblesEl.removeEventListener("mousedown",this.handleBubbleClose),this.bubblesEl.removeEventListener("click",this.handleBubbleClick),this.el.removeChild(this.bubblesEl),this.el.removeChild(this.addEl)),this.el.removeChild(this.menuWrapEl),this.el=null,this.input=null},t}(s)},73:function(e,t){}});
//# sourceMappingURL=extension.js.map