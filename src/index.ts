import { ADHDPerson } from './classes/adhd.person'
import { RegularPerson } from './classes/regular.person'

let neurotypical = new RegularPerson({
  occupation: 'Accountant',
  age: 34,
  name: 'John Doe',
  passions: ['Hiking', 'Scuba Diving'],
  married: false,
})

let adhder = new ADHDPerson({
  occupation: 'Software Engineer',
  age: 35,
  name: 'Laurent Schwitter',
  passions: ['Board Games', 'Coding', 'Video Games'],
  dog: 'Jack',
})

let start = async () => {
  let $$ = neurotypical.approach(adhder)
  for (let $ of $$) if (!$.closed) await $.toPromise()

  console.log('\x1b[0m')
  neurotypical.reportMemory()
  adhder.reportMemory()
}
start()
