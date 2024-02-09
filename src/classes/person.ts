import { Subject } from 'rxjs'
import { v4 } from 'uuid'
import { ADHDPerson } from './adhd.person'

export interface IInfo {
  name: string
  age: number
  occupation: string
  passions: string[]
  [key: string]: any
}

export abstract class Person {
  info: IInfo
  memory: {
    [key: string]: any
    people: { id: string; info: Partial<IInfo> }[]
  } = { people: [] }

  constructor(info: IInfo) {
    this.info = info
  }

  protected _color: string = '\x1b[36m'

  private _collectInfo(): {
    me$: Subject<{ k: string; v: any }>
    myInfo: { k: string; v: any }[]
  } {
    let myInfo = Object.keys(this.info).map((k) => {
      return {
        k: k,
        v: this.info[k],
      }
    })

    return { me$: new Subject<{ k: string; v: any }>(), myInfo }
  }

  approach(someone: Person): Subject<any>[] {
    let info = this._collectInfo()
    let { me$, myInfo } = info
    let meetee$ = someone.introduce(me$)
    me$ = this.introduce(meetee$, info)
    console.log(
      this._color,
      `\n${this.info.name}:\n"Hey nice to meet you! Here's some information about myself: '${myInfo[0].k}' : '${myInfo[0].v}'"`
    )
    me$.next(myInfo[0])
    return [me$, meetee$]
  }

  introduce(
    meetee$: Subject<{ k: string; v: any }>,
    me?: {
      me$: Subject<{ k: string; v: any }>
      myInfo: { k: string; v: any }[]
    }
  ): Subject<{ k: string; v: any }> {
    let me$,
      myInfo,
      given = 0
    if (me) {
      me$ = me.me$
      myInfo = me.myInfo
      given = 1
    } else {
      myInfo = Object.keys(this.info).map((k) => {
        return {
          k: k,
          v: this.info[k],
        }
      })

      given = 0
      me$ = new Subject<{ k: string; v: any }>()
    }

    let _sub = meetee$.subscribe(async ({ k, v }) => {
      console.log(this._color, '\n')
      if (/goodbye/i.test(k)) {
        _sub.unsubscribe()
        console.log(`${this.info.name}:\n"Yeah, totally! See ya..."`)
        me$.next({
          k: 'goodbye',
          v: null,
        })
        return me$.complete()
      } else if (!/answer/i.test(k)) {
        let success = await this.storeInformation({ k, v }, meetee$).catch(
          (e) => {
            console.log(
              `\x1b[31m${this.info.name}'s Brain:\n***${e.message}***${this._color}`
            )
          }
        )
        if (success)
          console.log(
            `${this.info.name}'s Brain:\n***Hey buddy I'm saving '${k}': '${v}' under this person's files...***`
          )
      }

      if (given < myInfo.length) {
        let info = myInfo[given++]
        console.log(
          `\n${this.info.name}: \n"Here's something about myself: '${info.k}': '${info.v}'"`
        )
        me$.next(info)
      } else {
        console.log(
          `\n${this.info.name}:\n"Well it was nice meeting you... See you around!"`
        )
        _sub.unsubscribe()

        me$.next({
          k: 'goodbye',
          v: null,
        })
        me$.complete()
      }
    })

    return me$
  }

  protected faces: { who: Subject<any>; uuid: string }[] = []
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
          if (this.memory.people.map((p) => p.id).includes(face.uuid)) {
            let i = this.memory.people.map((p) => p.id).indexOf(face.uuid)
            let [buffer] = this.memory.people.splice(i, 1)
            buffer.id = data.v
            this.memory.people.push(buffer)
          }
          face.uuid = data.v
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

  reportMemory() {
    console.log(
      `\n\n----------\n\nHere's what ${this.info.name} ${
        this instanceof ADHDPerson ? '(ADHD) ' : ''
      }remembers:\n`
    )
    console.log(JSON.stringify(this.memory, null, 2))
  }
}
