const password = document.querySelector('#password');

async function submit() {
  const result = await fetch('/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: password.value }),
  }).then((res) => res.text());
  if (result === 'success') {
    window.location.reload();
  } else {
    alert(result);
  }
}
