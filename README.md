# shape-animation

A canvas animation in React with configurable shapes and speeds.

### Version: 1.0.0

---

### 🌟 Codepen Example

- [Shape animation](https://codepen.io/tobywilson1/pen/OJRwdgx)

---

### ⚙ Installation & Running

```sh
$ npm install
```

```sh
$ npm start
```

---

### 🤔 How to use it?

#### 1. Events triggering new shapes

Resizing of window or moving mouse over the canvas.

#### 2. Rate of production of new particles

Edit the spawnRate at the top of CanvasUtils.js. Parameter range is 0 to 10 [0 is no spawning, 10 is the fastest rate].

#### 3. Adding new shapes

Shapes are represented as properties of the drawShape object in CanvasUtils.js. Just follow the example of the existing shapes to add a new one. Shapes are randomly selected during the spawning process.
