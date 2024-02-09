import { Subject } from 'rxjs'
import { v4 } from 'uuid'
import { Person } from './person'

export class ADHDPerson extends Person {
  protected _color: string = '\x1b[33m'

  async storeInformation(
    data: { k: string; v: any },
    person?: Subject<any>
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        //if information irrelevant to person, store it globally
        if (!person) return (this.memory[data.k] = data.v)

        //stores the face in references or retrieves it
        let face: { who: Subject<any>; uuid: string }
        if (this.faces.map((f) => f.who).includes(person)) {
          face = this.faces[this.faces.map((f) => f.who).indexOf(person)]
        } else {
          face = { who: person, uuid: v4() }
          this.faces.push(face)
        }

        //replaces uuid with actual name
        if (/name/gi.test(data.k)) {
          throw new Error(
            `Heyyya buddy... when's the last time we had a diet coke?`
          )
        }

        let memory

        if (this.memory.people.map((p) => p.id).includes(face.uuid)) {
          memory =
            this.memory.people[
              this.memory.people.map((p) => p.id).indexOf(face.uuid)
            ]
          memory.info[data.k] = data.v
        } else {
          let info = {}
          info[data.k] = data.v
          this.memory.people.push({ id: face.uuid, info: info })
        }

        resolve(true)
      } catch (e) {
        reject(e)
      }
    })
  }
}
