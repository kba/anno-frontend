module.exports = {
    props: {
        title:       String,
        prefix:      {type: String, default: 'ubhdannoprefix_zoneeditor'},
        glyphicon:   String,
        fontAwesome: String,
        src:         String,
        alt:         String,
        clickTarget: {type: Object},
        btnSize:     {type: String, default: 'sm'},
        btnClass:    {type: String, default: 'default'},
    },
    template: require('./bootstrap-button.html'),
}
