function visualHash() {
    // var lastBlur = null;
    var inputElements = document.getElementsByTagName('input');
    for (var input in inputElements) {
        if (inputElements[input].type == 'password') {
            attachHashAsYouType(inputElements[input]);
        }
    }

    function attachHashAsYouType(passwordElem) {
        var oldBackgroundImage = passwordElem.style['backgroundImage'];
        var oldBackgroundColor = passwordElem.style['backgroundColor'];
        var oldKeyDown = passwordElem.onkeydown;

        function restoreBackgroundColor(elem) {
            elem.style['backgroundImage'] = oldBackgroundImage;
            elem.style['backgroundColor'] = oldBackgroundColor;
        }

        function updateVisualHash(elem) {
            if (elem.value == '' || elem != document.activeElement) {
                restoreBackgroundColor(elem);
                return;
            }
            var passwordHash = SHA1(elem.value);
            // var gradientString = gradientStringForHash(passwordHash);

            // elem.style['backgroundImage'] = gradientString;
            var elemWidth = Math.max(elem.clientWidth,elem.offsetWidth);
            var elemHeight = Math.max(elem.clientHeight,elem.offsetHeight);
            elem.style['backgroundImage'] = 'url(' + getDataURLForHash(passwordHash,elemWidth,elemHeight) + ')';
            // elem.style['backgroundSize'] = '100%';
        }
        
        // TODO: find if there's another way of keeping track of typed updates.
        passwordElem.onkeydown = function() { 
            setTimeout(function() {
                updateVisualHash(passwordElem)
            },10);

            if (oldKeyDown)
                oldKeyDown.apply(this,arguments);
        };
        var oldFocus = passwordElem.onfocus;
        passwordElem.onfocus = function() {

            if (self.port)
                self.port.emit('focus',{
                    type: 'focus',
                    pos: findPos(this),
                    password: this.value
                });

            if (oldFocus)
                oldFocus.apply(this,arguments);
        };

        var oldBlur = passwordElem.onblur;
        passwordElem.onblur = function() {
            restoreBackgroundColor(this);

            window.lastBlur = passwordElem;
            if (self.port)
                self.port.emit('blur',{
                    type: 'blur',
                    clientRect: passwordElem.getBoundingClientRect(),
                    hasFocus: document.activeElement == this,
                    host: window.location.host,
                    href: window.location.href,
                    password: this.value
                });

            if (oldBlur)
                oldBlur.apply(this,arguments);
        };
    }
}

visualHash();