from flask import Flask
from flask import render_template
import random
from flask.ext.triangle import Triangle
app = Flask(__name__)
Triangle(app)

app.debug = True


@app.route('/')
def index(name=None):
    return render_template('index.html', name=random.randint(1,1000))


@app.route('/test')
def test(name=None):
    return render_template('index.html', name=random.randint(1000,2000))

if __name__ == '__main__':
    app.run()
