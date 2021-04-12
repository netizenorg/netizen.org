const students = [
  'Thor',
  'Camilla',
  'Olivia',
  'Michelle',
  'Max',
  'Mickey',
  'Ursula',
  'Amber',
  'Nathan',
  'Simren',
  'Hakim',
  'Maddie',
  'Khalil',
  'Alex',
  'Camrick',
  'Giacomo',
  'Azam',
  'Rahman'
]

function invalid (url, name, assign) {
  if (!url || url === '') return 'missing URL'
  if (!name || name === '') return 'missing name'
  if (!students.includes(name)) return `${name} is not a student in this class`
  if (assign === 'assignment') return 'choose an assignment from the drop down list'
  if (url.indexOf('https://github.com') !== 0) {
    return 'the URL entered is not a valid github URL'
  } else return false
}

function success (res) {
  if (res.message === 'thnx! your work has been submitted') {
    const url = document.querySelector('#url')
    const name = document.querySelector('#name')
    const assignment = document.querySelector('#assignment')
    url.value = ''
    name.value = ''
    assignment.value = 'assignment'
  }
  window.alert(res.message)
}

function submit () {
  const url = document.querySelector('#url').value
  const name = document.querySelector('#name').value
  const assignment = document.querySelector('#assignment').value
  const err = invalid(url, name, assignment)
  if (err) return window.alert(err)
  const opts = {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url, name, assignment })
  }
  window.fetch('/api/netart2/assignment', opts)
    .then(res => res.json())
    .then(res => success(res))
    .catch(err => window.alert(err))
}

const submitBtn = document.querySelector('#submit')
submitBtn.addEventListener('click', submit)
