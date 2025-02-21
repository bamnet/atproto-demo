import './style.css'


function hello(div: HTMLElement) {
  div.innerHTML = 'Hello World!';
}

hello(document.querySelector<HTMLButtonElement>('#app')!);
