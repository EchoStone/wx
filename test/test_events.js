const events = require(__dirname + '/../src/logic/events'),
    expect = require('chai').expect

class WXIOMock extends events.WXIO {

    executeAction(action) {
        console.log('WXIOMock.executeAction')
        setTimeout(() => {
            console.log('WXIOMock.executeAction after 0.1 second call super method')
            super.executeAction(action)
        }, 100)

        setTimeout(() => {
            console.log('WXIOMock.executeAction after 0.2 second call feed')
            let move = new events.Response('MovePointRequest', {
                result: true
            });
            this.feed(move)
        }, 1000)
    }
}

describe('', async() => {
    it('', async () => {
        
    })
})

describe('', async () => {
    it('', async () => {
        let datetimeBeforeMove = new Date()
        let io = new WXIOMock(pusher)
        // network.io = io

        let controller = new events.AIController(io)
        let response = await controller.movePointRequest({
            x: 1,
            y: 2
        })

        expect(response.result).to.be.true
        let datetimeAfterMoveAndWait = new Date()

        expect(datetimeAfterMoveAndWait.getTime() - datetimeBeforeMove.getTime())
            .to.be.above(1000)
    })
})