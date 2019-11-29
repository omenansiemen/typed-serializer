"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isUndefined = (val) => typeof val === 'undefined';
const isBoolean = (val) => typeof val === 'boolean';
const isObject = (val) => typeof val === 'object';
const isArray = (val) => typeof val === 'object' && Array.isArray(val);
const isNumber = (val) => typeof val === 'number';
const uint8Max = 255;
const int8Min = -128;
const int8Max = 127;
const uint16Max = 65535;
const int16Min = -32768;
const int16Max = 32767;
const uint32Max = 4294967295;
const int32Min = -2147483648;
const int32Max = 2147483647;
var Types;
(function (Types) {
    Types["int8"] = "int8";
    Types["uint8"] = "uint8";
    Types["int16"] = "int16";
    Types["uint16"] = "uint16";
    Types["int32"] = "int32";
    Types["uint32"] = "uint32";
    Types["float32"] = "float32";
    Types["float64"] = "float64";
    Types["boolean"] = "boolean";
    Types["string8"] = "string8";
    Types["string16"] = "string16";
    Types["string"] = "string";
})(Types = exports.Types || (exports.Types = {}));
const isMetaValue = (object) => {
    if (typeof object.type === 'string') {
        return true;
    }
    return false;
};
const defaultTemplateOptions = {
    arrayMaxLength: Types.uint32
};
function flatten(data, template, refObject) {
    if (isArray(data) && isArray(template)) {
        // assertArrayLength(refObject, data);
        // Storing information how many elements there are
        const arrayLength = {
            type: refObject.templateOptions.arrayMaxLength
        };
        processMetaValue(refObject, arrayLength, data.length);
        refObject.byteOffset += getByteLength(arrayLength, data.length);
        data.forEach((element) => {
            if (isObject(element)) {
                flatten(element, template[0], refObject);
            }
            else {
                flatten(element, template, refObject);
            }
        });
    }
    else {
        Object.keys(template).forEach(key => {
            var _a;
            const value = (_a = data[key], (_a !== null && _a !== void 0 ? _a : data));
            const templateValue = template[key];
            if (isObject(value)) {
                flatten(value, templateValue, refObject);
            }
            else if (typeof value === 'string' && isMetaValue(templateValue)) {
                const rawValue = encodeText(value);
                // Storing length of bytes of string
                // assertStringLength(templateValue.type, rawValue, key)
                const type = getTypeForStringLength(templateValue.type);
                const stringLength = { type };
                processMetaValue(refObject, stringLength, rawValue.byteLength);
                refObject.byteOffset += getByteLength(stringLength, rawValue.byteLength);
                // Storing value as Uint8Array of bytes
                processMetaValue(refObject, templateValue, rawValue);
                refObject.byteOffset += rawValue.byteLength;
            }
            else if ((isNumber(value) || isBoolean(value)) && isMetaValue(templateValue)) {
                processMetaValue(refObject, templateValue, value);
                refObject.byteOffset += getByteLength(templateValue, value);
            }
            else {
                if (isUndefined(value)) {
                    console.warn('Template property', key, 'is not found from data', data);
                }
                console.error('This error must be fixed! Otherwise unflattening won\'t work. Details below.');
                console.debug('data:', data, 'template:', template, 'key of template:', key);
                console.debug('is template[key] metavalue', isMetaValue(templateValue));
            }
        });
    }
}
const calculateBufferSize = (data, template, options, size = 0) => {
    if (isArray(data) && isArray(template)) {
        // Storing information how many elements there are
        const arrayLength = {
            type: options.arrayMaxLength
        };
        size += getByteLength(arrayLength, data.length);
        for (let element of data) {
            if (isObject(element)) {
                size += calculateBufferSize(element, template[0], options) * data.length;
            }
            else {
                size += calculateBufferSize(element, template, options) * data.length;
            }
            break;
        }
    }
    else {
        Object.keys(template).forEach(key => {
            var _a;
            const value = (_a = data[key], (_a !== null && _a !== void 0 ? _a : data));
            const templateValue = template[key];
            if (isObject(value)) {
                size += calculateBufferSize(value, templateValue, options);
            }
            else if (typeof value === 'string' && isMetaValue(templateValue)) {
                const rawValue = encodeText(value);
                // Storing length of bytes of string
                const type = getTypeForStringLength(templateValue.type);
                const stringLength = { type };
                size += getByteLength(stringLength, rawValue.byteLength);
                // Storing value as Uint8Array of bytes
                size += rawValue.byteLength;
            }
            else if ((isNumber(value) || isBoolean(value)) && isMetaValue(templateValue)) {
                size += getByteLength(templateValue, value);
            }
        });
    }
    return size;
};
const getTypeForStringLength = (type) => {
    if (type === Types.string8) {
        return Types.uint8;
    }
    else if (type === Types.string16) {
        return Types.uint16;
    }
    return Types.uint32;
};
function assertStringLength(type, rawValue, key) {
    if (type === Types.string8) {
        console.assert(rawValue.byteLength <= uint8Max, `Error in value of property "${key}": string is too long for uint8 slot (${rawValue.byteLength})`);
    }
    else if (type === Types.string16) {
        console.assert(rawValue.byteLength <= uint16Max, `Error in value of property "${key}": string is too long for uint16 slot (${rawValue.byteLength})`);
    }
    else if (type === Types.string) {
        console.assert(rawValue.byteLength <= uint32Max, `Error in value of property "${key}": string is too long for uint32 slot (${rawValue.byteLength})`);
    }
}
function assertArrayLength(refObject, data) {
    if (refObject.templateOptions.arrayMaxLength === Types.uint8) {
        console.assert(data.length <= uint8Max, `Array is too long (${data.length}) for the length type uint8`);
    }
    else if (refObject.templateOptions.arrayMaxLength === Types.uint16) {
        console.assert(data.length <= uint16Max, `Array is too long (${data.length}) for the length type uint16`);
    }
    else if (refObject.templateOptions.arrayMaxLength === Types.uint32) {
        console.assert(data.length <= uint32Max, `Array is too long (${data.length}) for the length type uint32`);
    }
}
function processMetaValue(refObject, metaValue, value) {
    addToBuffer({
        metaValue,
        refObject,
        value
    });
}
const addToBuffer = (params) => {
    const { metaValue, refObject } = params;
    let value = params.value;
    const byteLength = getByteLength(metaValue, value);
    const view = new DataView(refObject.buffer, refObject.byteOffset, byteLength);
    if (isNumber(metaValue.multiplier) && isNumber(value)) {
        value = value * metaValue.multiplier;
    }
    if (metaValue.type === Types.boolean && isBoolean(value)) {
        view.setInt8(0, value === false ? 0 : 1);
    }
    else if (metaValue.type === Types.uint8 && isNumber(value)) {
        if (metaValue.preventOverflow) {
            value = (value < 0 ? 0 : (value > uint8Max ? uint8Max : value));
        }
        view.setUint8(0, value);
    }
    else if (metaValue.type === Types.int8 && isNumber(value)) {
        if (metaValue.preventOverflow) {
            value = (value < int8Min ? int8Min : (value > int8Max ? int8Max : value));
        }
        view.setInt8(0, value);
    }
    else if (metaValue.type === Types.uint16 && isNumber(value)) {
        if (metaValue.preventOverflow) {
            value = (value < 0 ? 0 : (value > uint16Max ? uint16Max : value));
        }
        view.setUint16(0, value);
    }
    else if (metaValue.type === Types.int16 && isNumber(value)) {
        if (metaValue.preventOverflow) {
            value = (value < int16Min ? int16Min : (value > int16Max ? int16Max : value));
        }
        view.setInt16(0, value);
    }
    else if (metaValue.type === Types.uint32 && isNumber(value)) {
        if (metaValue.preventOverflow) {
            value = (value < 0 ? 0 : (value > uint32Max ? uint32Max : value));
        }
        view.setUint32(0, value);
    }
    else if (metaValue.type === Types.int32 && isNumber(value)) {
        if (metaValue.preventOverflow) {
            value = (value < int32Min ? int32Min : (value > int32Max ? int32Max : value));
        }
        view.setInt32(0, value);
    }
    else if (metaValue.type === Types.float32 && isNumber(value)) {
        view.setFloat32(0, value);
    }
    else if (metaValue.type === Types.float64 && isNumber(value)) {
        view.setFloat64(0, value);
    }
    else {
        if (metaValue.type === Types.string8 || metaValue.type === Types.string16 || metaValue.type === Types.string) {
            if (value instanceof Uint8Array) {
                value.forEach((value, slot) => view.setUint8(slot, value));
            }
            else {
                console.error('Unknown metaValue.type', metaValue.type, value);
            }
        }
        else {
            console.error('Unknown metaValue.type', metaValue.type, value);
        }
    }
    return byteLength;
};
function getByteLength(metaValue, value) {
    let byteLength;
    if (metaValue.type === Types.float64) {
        byteLength = 8;
    }
    else if (metaValue.type === Types.int32 || metaValue.type === Types.uint32 || metaValue.type === Types.float32) {
        byteLength = 4;
    }
    else if (metaValue.type === Types.int16 || metaValue.type === Types.uint16) {
        byteLength = 2;
    }
    else if (metaValue.type === Types.int8 || metaValue.type === Types.uint8 || metaValue.type === Types.boolean) {
        byteLength = 1;
    }
    else if (metaValue.type === Types.string8 || metaValue.type === Types.string16 || metaValue.type === Types.string) {
        if (value instanceof Uint8Array) {
            // Flattening
            byteLength = value.byteLength;
        }
        else {
            // Unflattening
            if (metaValue.type === Types.string8) {
                byteLength = 1;
            }
            else if (metaValue.type === Types.string16) {
                byteLength = 2;
            }
            else {
                byteLength = 4; // Slot for length of the text as bytes
            }
        }
    }
    else {
        throw Error(`Unknown type: ${metaValue.type}`);
    }
    return byteLength;
}
function unflatten(buffer, template, options, firstCall = false) {
    let result;
    if (isArray(template)) {
        result = [];
        const { value: length, byteOffset: newOffset } = getValueFromBuffer(buffer, { type: options.templateOptions.arrayMaxLength }, options.byteOffset);
        options.byteOffset = newOffset;
        for (let i = 0; i < length; i++) {
            const item = unflatten(buffer, template[0], options);
            if (firstCall && typeof options.templateOptions.arrayCallback === 'function') {
                options.templateOptions.arrayCallback(item);
            }
            result.push(item);
        }
    }
    else {
        result = {};
        if (isMetaValue(template)) {
            const { value, byteOffset: newOffset } = getValueFromBuffer(buffer, template, options.byteOffset);
            options.byteOffset = newOffset;
            result = value;
        }
        else {
            Object.keys(template).forEach(key => {
                if (isMetaValue(template[key])) {
                    const { value, byteOffset: newOffset } = getValueFromBuffer(buffer, template[key], options.byteOffset);
                    options.byteOffset = newOffset;
                    result[key] = value;
                }
                else {
                    const obj = unflatten(buffer, template[key], options);
                    result[key] = obj;
                }
            });
        }
    }
    return result;
}
function getValueFromBuffer(buffer, metaValue, byteOffset) {
    let value;
    let byteLength = getByteLength(metaValue);
    // console.assert(byteOffset + byteLength <= buffer.byteLength, `${byteOffset} + ${byteLength} <= ${buffer.byteLength}`)
    var view = new DataView(buffer, byteOffset, byteLength);
    if (metaValue.type === Types.uint8) {
        value = view.getUint8(0);
    }
    else if (metaValue.type === Types.int8) {
        value = view.getInt8(0);
    }
    else if (metaValue.type === Types.uint16) {
        value = view.getUint16(0);
    }
    else if (metaValue.type === Types.int16) {
        value = view.getInt16(0);
    }
    else if (metaValue.type === Types.uint32) {
        value = view.getUint32(0);
    }
    else if (metaValue.type === Types.int32) {
        value = view.getInt32(0);
    }
    else if (metaValue.type === Types.float32) {
        value = view.getFloat32(0);
    }
    else if (metaValue.type === Types.float64) {
        value = view.getFloat64(0);
    }
    else if (metaValue.type === Types.boolean) {
        value = view.getInt8(0) === 0 ? false : true;
    }
    else if (metaValue.type === Types.string8 || metaValue.type === Types.string16 || metaValue.type === Types.string) {
        let strBufLen;
        let strBufStart;
        if (metaValue.type === Types.string8) {
            strBufLen = view.getUint8(0);
            byteLength += strBufLen;
            strBufStart = byteOffset + 1;
        }
        else if (metaValue.type === Types.string16) {
            strBufLen = view.getUint16(0);
            byteLength += strBufLen;
            strBufStart = byteOffset + 2;
        }
        else {
            strBufLen = view.getUint32(0);
            byteLength += strBufLen;
            strBufStart = byteOffset + 4;
        }
        const strBufEnd = strBufStart + strBufLen;
        value = decodeText(buffer.slice(strBufStart, strBufEnd));
    }
    else {
        throw Error(`Unknown metaValue.type ${metaValue}`);
    }
    if (isNumber(metaValue.multiplier) && isNumber(value)) {
        value = value / metaValue.multiplier;
    }
    return { value, byteOffset: byteOffset + byteLength };
}
exports.pack = (object, template, extra = {}) => {
    const { sharedBuffer, returnCopy = false, freeBytes = 0, } = extra;
    let templateOptions = defaultTemplateOptions;
    if (typeof template._netSerializer_ === 'object') {
        templateOptions = Object.assign(Object.assign({}, templateOptions), template._netSerializer_.options);
        template = template._netSerializer_.template;
    }
    const sizeInBytes = calculateBufferSize(object, template, templateOptions);
    let buffer;
    if (typeof sharedBuffer !== 'undefined') {
        buffer = sharedBuffer;
    }
    else {
        buffer = new ArrayBuffer(sizeInBytes + freeBytes);
    }
    flatten(object, template, {
        byteOffset: 0,
        buffer,
        templateOptions,
    });
    if (typeof sharedBuffer !== 'undefined' && returnCopy) {
        return buffer.slice(0, sizeInBytes);
    }
    return buffer;
};
exports.unpack = (buffer, template) => {
    let templateOptions = defaultTemplateOptions;
    if (typeof template._netSerializer_ === 'object') {
        templateOptions = Object.assign(Object.assign({}, templateOptions), template._netSerializer_.options);
        template = template._netSerializer_.template;
    }
    return unflatten(buffer, template, { byteOffset: 0, templateOptions }, true);
};
const MakeDecoderFn = (decoder) => (input) => decoder.decode(input);
let decodeText;
const setTextDecoder = (decoder) => {
    decodeText = MakeDecoderFn(decoder);
};
if (typeof TextDecoder === 'function') {
    setTextDecoder(new TextDecoder());
}
const MakeEncoderFn = (encoder) => (input) => encoder.encode(input);
let encodeText;
const setTextEncoder = (encoder) => {
    encodeText = MakeEncoderFn(encoder);
};
if (typeof TextEncoder === 'function') {
    setTextEncoder(new TextEncoder());
}
exports.setTextHandler = (handler) => {
    encodeText = MakeEncoderFn(handler);
    decodeText = MakeDecoderFn(handler);
};
const NetSerializer = {
    pack: exports.pack,
    unpack: exports.unpack,
    setTextHandler: exports.setTextHandler,
    Types,
};
exports.default = NetSerializer;
