import TankWorker from "@/tank/js/tank/TankWorker.js?worker";

class ThreadPool {
  constructor(maxThread) {
    this.maxThread = maxThread;
    this.queue = [];
    this.threadCount = 0;
    this.workerQueue = [];
    this.messageMap = {};

    for (let i = 0; i < maxThread; i++) {
      console.log(`init ${i}`);
      this.workerQueue.push(new TankWorker());
    }
  }

  execute(task) {
    task.id -= 1;
    this.messageMap[task.id] = task.onmessage;
    if (this.threadCount === this.maxThread) {
      this.queue.push(task);
    } else {
      this.runTask(task);
    }
  }

  setMaxThread(maxThread) {
    this.maxThread = maxThread;
  }

  shutdown() {
    this.queue.length = 0;
  }

  onmessage(id, ev) {
    this.messageMap[id](ev);
  }

  runTask(task) {
    console.log("task: ", task);

    this.threadCount++;
    this.workerQueue[task.id].postMessage(task.option);
    this.workerQueue[task.id].onmessage = (ev) => {
      this.onmessage(task.id, ev);
    };
    this.threadCount--;
    if (this.queue.length > 0) {
      this.runTask(this.queue.shift());
    }
  }
}

export const threadPool = new ThreadPool(4);
