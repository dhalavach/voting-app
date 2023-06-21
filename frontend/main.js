const PORT = 7481;
const IP_DIGITAL_OCEAN = '165.22.73.91';

class VotingBlock {
  constructor(root, title) {
    this.root = root;
    this.selected = sessionStorage.getItem('selected');
    this.endpoint = `http://${IP_DIGITAL_OCEAN}:${PORT}/vote`;
    // this.endpoint = 'http://localhost:7481/vote';
    this.root.insertAdjacentHTML(
      'afterbegin',
      `<div class = voting-block__title>${title}</div>`
    );
    this._refresh();
  }

  async _refresh() {
    const response = await fetch(this.endpoint);
    const data = await response.json();
    console.log('test data: ', data);

    this.root.querySelectorAll('.voting-block__option').forEach((option) => {
      option.remove();
    });

    let keys = Object.keys(data);
    console.log(keys);

    for (let option of keys) {
      let template = document.createElement('template');
      let fragment = template.content;

      template.innerHTML = `
      <div class="voting-block__option ${
        this.selected === option ? 'selected' : ''
      }">
      <div class="voting-block__option-info">
        <span class="voting-block__option-label">${option}</span>
        <span class="voting-block__option-votes">${data[option]}</span>
      </div>
      </div>
      `;

      if (!this.selected) {
        fragment
          .querySelector('.voting-block__option')
          .addEventListener('click', () => {
            console.log(option);
            fetch(this.endpoint, {
              method: 'post',
              body: `add=${option}`,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }).then(() => {
              this.selected = option;
              sessionStorage.setItem('selected', option);
              this._refresh();
            });
          });
      }

      this.root.appendChild(fragment);
    }
  }
}

const vote = new VotingBlock(
  document.querySelector('.voting-block'),
  'Pick one option'
);
console.log(vote);
