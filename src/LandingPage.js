//import { Hideable } from "./Hideable";
import { debounce } from "./debounce";
import { ErrorLogger } from "./ErrorLogger";

export class LandingPage {
  constructor() {
    this.main = document.querySelector('#landing-page');
    this.input = document.querySelector('#repo-search input');
    this.results = {
      container: document.querySelector('#repo-search div'),
      spinner: document.querySelector('#repo-search .spinner'),
      error: document.querySelector('#repo-search #error'),
      list: document.querySelector('#repo-search ol'),
    };

    this.showNothing();

    this.debouncedMakeSearchRequest = debounce(
      () => this.makeSearchRequest.call(this),
      1000
    );

    this.input.addEventListener(
      'input', 
      event => this.inputHandler.call(this, event)
    );
  }

  show() {
    this.main.style.display = '';
    this.main.hidden = false;
    this.input.focus();
  }

  hide() {
    this.main.style.display = 'none';
    this.main.hidden = true;
  }

  showNothing() {
    this.results.container.style.display = 'none';
    this.results.spinner.style.display = 'none';
    this.results.error.style.display = 'none';
    this.results.list.style.display = 'none';
  }

  showLoading() {
    this.results.container.style.display = '';
    this.results.spinner.style.display = '';
    this.results.error.style.display = 'none';
    this.results.list.style.display = 'none';
  }

  showError() {
    this.results.container.style.display = '';
    this.results.spinner.style.display = 'none';
    this.results.error.style.display = '';
    this.results.list.style.display = 'none';
  }

  showResults() {
    this.results.container.style.display = '';
    this.results.spinner.style.display = 'none';
    this.results.error.style.display = 'none';
    this.results.list.style.display = '';
  }

  clearResults() {
    this.results.list.replaceChildren();
  }

  // This method also has side effects in the UI-- either showing the 
  // #repo-search #results or the #repo-search #error
  async makeSearchRequest() {
    const term = encodeURIComponent(this.input.value);
    const url = `https://api.github.com/search/repositories?q=${term}`;
    console.log(`GET ${url}`);
    const res = await fetch(url);

    if (res.status !== 200) {
      this.results.error.innerText = 
          ErrorLogger.httpsError(res.url, res.status);
      this.showError();

    } else {
      const { items } = await res.json();
      this.results.list.append(
        ...items.map(this.createSearchResultsListItem)
      );
      this.showResults();
    }
  }

  createSearchResultsListItem(item) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const img = document.createElement('img');
    const span = document.createElement('span');
    const b = document.createElement('b');

    li.append(a);
    a.append(img, span);

    const owner = item.owner.login;
    const name = item.name;
    
    a.href = `/${owner}/${name}?defaultBranch=${item.default_branch}`;
    a.className = 'rounded centered tabable gray repo-card';

    img.src = `${item.owner.avatar_url}&s=48`;
    img.alt = `Avatar image for ${owner}/${name}`;

    span.append(`${owner} / `, b);

    b.innerText = name;

    return li;
  }

  async inputHandler(event) {
    this.clearResults();

    if (event.target.value === '') {
      this.showNothing();

    } else {
      this.showLoading();
      this.debouncedMakeSearchRequest();
    }
  }
}