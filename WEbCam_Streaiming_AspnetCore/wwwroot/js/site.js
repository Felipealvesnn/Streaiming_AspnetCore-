﻿// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

const generateId = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
};

const scrollToBottom = (id) => {
    const element = $(`#${id}`);
    element.animate({
        scrollTop: element.prop("scrollHeight")
    }, 100);
}

const BlockUi = ()=>
    $.blockUI({
    css: {
        border: 'none',
        padding: '10px',
        backgroundColor: '#000',
        '-webkit-border-radius': '10px',
        '-moz-border-radius': '10px',
        opacity: .5,
        color: '#fff'
    },
    message: '<h1>Espere o Atendente Atender...</h1>',
    baseZ: 2000
});