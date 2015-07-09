from flask import Flask
from flask import render_template
import random
app = Flask(__name__)

app.debug = True


@app.route('/')
def hello(name=None):
    return render_template('hello.html', name=random.randint(1,1000))


@app.route('/test')
def test(name=None):
    return render_template('hello.html', name=random.randint(1000,2000))

if __name__ == '__main__':
    app.run()
