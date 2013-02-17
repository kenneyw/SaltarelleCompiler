///////////////////////////////////////////////////////////////////////////////
// Type System Implementation

ss.registerType = function#? DEBUG Type$registerType##(root, typeName, type) {
	var ns = root;
	var nameParts = typeName.split('.');

	for (var i = 0; i < nameParts.length - 1; i++) {
		var part = nameParts[i];
		var nso = ns[part];
		if (!nso) {
			ns[part] = nso = {};
		}
		ns = nso;
	}
	ns[nameParts[nameParts.length - 1]] = type;
};

ss.__genericCache = {};

ss._makeGenericTypeName = function#? DEBUG ss$_makeGenericTypeName##(genericType, typeArguments) {
	var result = genericType.__typeName;
	for (var i = 0; i < typeArguments.length; i++)
		result += (i === 0 ? '[' : ',') + ss.getTypeFullName(typeArguments[i]);
	result += ']';
	return result;
};

ss.makeGenericType = function#? DEBUG ss$makeGenericType##(genericType, typeArguments) {
	var name = ss._makeGenericTypeName(genericType, typeArguments);
	return ss.__genericCache[name] || genericType.apply(null, typeArguments);
};

ss.registerGenericClassInstance = function#? DEBUG ss$registerGenericClassInstance##(instance, genericType, typeArguments, baseType, interfaceTypes) {
	var name = ss._makeGenericTypeName(genericType, typeArguments);
	ss.__genericCache[name] = instance;
	instance.__genericTypeDefinition = genericType;
	instance.__typeArguments = typeArguments;
	ss.registerClass(null, name, instance, baseType(), interfaceTypes(), genericType.__metadata);
};

ss.registerGenericInterfaceInstance = function#? DEBUG ss$registerGenericInterfaceInstance##(instance, genericType, typeArguments, baseInterfaces) {
	var name = ss._makeGenericTypeName(genericType, typeArguments);
	ss.__genericCache[name] = instance;
	instance.__genericTypeDefinition = genericType;
	instance.__typeArguments = typeArguments;
	ss.registerInterface(null, name, instance, baseInterfaces(), genericType.__metadata);
};

ss.isGenericTypeDefinition = function#? DEBUG ss$isGenericTypeDefinition##(type) {
	return type.__isGenericTypeDefinition || false;
};

ss.getGenericTypeDefinition = function#? DEBUG ss$getGenericTypeDefinition##(type) {
	return type.__genericTypeDefinition || null;
};

ss.getGenericParameterCount = function#? DEBUG ss$getGenericParameterCount##(type) {
	return type.__typeArgumentCount || 0;
};

ss.getGenericArguments = function#? DEBUG ss$getGenericArguments##(type) {
	return type.__typeArguments || null;
};

ss.registerClass = function#? DEBUG ss$registerClass##(root, name, ctor, baseType, interfaces, metadata) {
	if (root)
		ss.registerType(root, name, ctor);

	ctor.prototype.constructor = ctor;
	ctor.__typeName = name;
	ctor.__class = true;
	ctor.__baseType = baseType || Object;
	if (interfaces)
		ctor.__interfaces = interfaces;
	if (metadata)
		ctor.__metadata = metadata;

	if (baseType) {
		ss.setupBase(ctor);
	}
};

ss.registerGenericClass = function#? DEBUG ss$registerGenericClass##(root, name, ctor, typeArgumentCount, metadata) {
	if (root)
		ss.registerType(root, name, ctor);

	ctor.prototype.constructor = ctor;
	ctor.__typeName = name;
	ctor.__class = true;
	ctor.__typeArgumentCount = typeArgumentCount;
	ctor.__isGenericTypeDefinition = true;
	ctor.__baseType = Object;
	if (metadata)
		ctor.__metadata = metadata;
};

ss.registerInterface = function#? DEBUG ss$createInterface##(root, name, ctor, baseInterfaces, metadata) {
	if (root)
		ss.registerType(root, name, ctor);

	ctor.__typeName = name;
	ctor.__interface = true;
	if (baseInterfaces)
		ctor.__interfaces = baseInterfaces;
	if (metadata)
		ctor.__metadata = metadata;
};

ss.registerGenericInterface = function#? DEBUG ss$registerGenericClass##(root, name, ctor, typeArgumentCount, metadata) {
	if (root)
		ss.registerType(root, name, ctor);

	ctor.prototype.constructor = ctor;
	ctor.__typeName = name;
	ctor.__interface = true;;
	ctor.__typeArgumentCount = typeArgumentCount;
	ctor.__isGenericTypeDefinition = true;
	if (metadata)
		ctor.__metadata = metadata;
};

ss.registerEnum = function#? DEBUG ss$registerEnum##(root, name, ctor, metadata) {
	if (root)
		ss.registerType(root, name, ctor);

	for (var field in ctor.prototype)
		ctor[field] = ctor.prototype[field];

	ctor.__typeName = name;
	ctor.__enum = true;
	if (metadata)
		ctor.__metadata = metadata;
	ctor.getDefaultValue = ctor.createInstance = function() { return 0; };
	ctor.isInstanceOfType = function(instance) { return typeof(instance) == 'number'; };
};

ss.setupBase = function#? DEBUG Type$setupBase##(type) {
	var baseType = type.__baseType;

	for (var memberName in baseType.prototype) {
		var memberValue = baseType.prototype[memberName];
		if (!type.prototype[memberName]) {
			type.prototype[memberName] = memberValue;
		}
	}
};

ss.getBaseType = function#? DEBUG ss$getBaseType##(type) {
	return type.__baseType || (type === Object ? null : Object);
};

ss.getTypeFullName = function#? DEBUG ss$getTypeFullName##(type) {
	if (type === Array) return 'Array';
	if (type === Boolean) return 'Boolean';
	if (type === Date) return 'Date';
	if (type === Error) return 'Error';
	if (type === Function) return 'Function';
	if (type === Number) return 'Number';
	if (type === Object) return 'Object';
	if (type === RegExp) return 'RegExp';
	if (type === String) return 'String';
	return type.__typeName || 'Object';
};

ss.getTypeName = function#? DEBUG ss$getTypeName##(type) {
	var fullName = ss.getTypeFullName(type);
	var bIndex = fullName.indexOf('[');
	var nsIndex = fullName.lastIndexOf('.', bIndex >= 0 ? bIndex : fullName.length);
	return nsIndex > 0 ? fullName.substr(nsIndex + 1) : fullName;
};

ss.getInterfaces = function#? DEBUG ss$getInterfaces##(type) {
	if (type === Array)
		return [ ss_IEnumerable, ss_ICollection, ss_IList ];
	else if (type === Date || type === Number)
		return [ ss_IEquatable, ss_IComparable, ss_IFormattable ];
	else if (type === Boolean || type === String)
		return [ ss_IEquatable, ss_IComparable ];
	else
		return type.__interfaces || [];
};

ss.isInstanceOfType = function#? DEBUG ss$isInstanceOfType##(instance, type) {
	if (ss.isNullOrUndefined(instance))
		return false;

	if (typeof(type.isInstanceOfType) === 'function')
		return type.isInstanceOfType(instance);

	if ((type == Object) || (instance instanceof type)) {
		return true;
	}

	return ss.isAssignableFrom(type, ss.getInstanceType(instance));
};

ss.isAssignableFrom = function#? DEBUG ss$isAssignableFrom##(target, type) {
	if ((target == Object) || (target == type)) {
		return true;
	}
	if (target.__class) {
		var baseType = type.__baseType;
		while (baseType) {
			if (target == baseType) {
				return true;
			}
			baseType = baseType.__baseType;
		}
	}
	else if (target.__interface) {
		var interfaces = ss.getInterfaces(type);
		if (interfaces && ss.contains(interfaces, target)) {
			return true;
		}

		var baseType = ss.getBaseType(type);
		while (baseType) {
			interfaces = ss.getInterfaces(baseType);
			if (interfaces && ss.contains(interfaces, target)) {
				return true;
			}
			baseType = ss.getBaseType(baseType);
		}
	}
	return false;
};

ss.hasProperty = function#? DEBUG ss$hasProperty##(instance, name) {
	return typeof(instance['get_' + name]) === 'function' || typeof(instance['set_' + name]) === 'function';
};

ss.isClass = function#? DEBUG Type$isClass##(type) {
	return (type.__class == true || type === Array || type === Function || type === RegExp || type === String || type === Error || type === Object);
};

ss.isEnum = function#? DEBUG Type$isEnum##(type) {
	return (type.__enum == true);
};

ss.isFlags = function#? DEBUG Type$isFlags##(type) {
	return type.__metadata && type.__metadata.enumFlags;
};

ss.isInterface = function#? DEBUG Type$isInterface##(type) {
	return (type.__interface == true);
};

ss.safeCast = function#? DEBUG ss$safeCast##(instance, type) {
	return ss.isInstanceOfType(instance, type) ? instance : null;
};

ss.cast = function#? DEBUG ss$cast##(instance, type) {
	if (instance === null)
		return null;
	else if (typeof(instance) === "undefined" || ss.isInstanceOfType(instance, type)) {
		return instance;
	}
	throw 'Cannot cast object to type ' + ss.getTypeFullName(type);
};

ss.getInstanceType = function#? DEBUG ss$getInstanceType##(instance) {
	if (instance === null)
		throw 'Cannot get type of null';
	if (typeof(instance) === "undefined")
		throw 'Cannot get type of undefined';

	var ctor = null;

	// NOTE: We have to catch exceptions because the constructor
	//       cannot be looked up on native COM objects
	try {
		ctor = instance.constructor;
	}
	catch (ex) {
	}
	return ctor || Object;
};

ss.getType = function#? DEBUG ss$getType##(typeName) {
	if (!typeName) {
		return null;
	}

	if (!ss.__typeCache) {
		ss.__typeCache = {};
	}

	var type = ss.__typeCache[typeName];
	if (!type) {
		var arr = typeName.split(',');
		var type = (arr.length > 1 ? require(arr[1].trim) : global);

		var parts = arr[0].trim().split('.');
		for (var i = 0; i < parts.length; i++) {
			type = type[parts[i]];
			if (!type)
				break;
		}

		ss.__typeCache[typeName] = type || null;
	}
	return type;
};

ss.getDefaultValue = function#? DEBUG ss$getDefaultValue##(type) {
	if (typeof(type.getDefaultValue) === 'function')
		return type.getDefaultValue();
	else if (type === Boolean)
		return false;
	else if (type === Date)
		return new Date(0);
	else if (type === Number)
		return 0;
	return null;
};

ss.createInstance = function#? DEBUG ss$createInstance##(type) {
	if (typeof(type.createInstance) === 'function')
		return type.createInstance();
	else if (type === Boolean)
		return false;
	else if (type === Date)
		return new Date(0);
	else if (type === Number)
		return 0;
	else if (type === String)
		return '';
	else
		return new type();
};

ss.applyConstructor = function#? DEBUG ss$applyConstructor##(constructor, args) {
	var f = function() {
		return constructor.apply(this, args);
	};
	f.prototype = constructor.prototype;
	return new f();
};

ss.getAttributes = function#? DEBUG ss$getAttributes##(type, attrType, inherit) {
	var result = inherit && type.__baseType ? ss.getAttributes(type.__baseType, attrType, true).filter(function(a) { var t = ss.getInstanceType(a); return !t.__metadata || !t.__metadata.attrNoInherit; }) : [];
	if (type.__metadata && type.__metadata.attr) {
		for (var i = 0; i < type.__metadata.attr.length; i++) {
			var a = type.__metadata.attr[i];
			if (attrType == null || ss.isInstanceOfType(a, attrType)) {
				var t = ss.getInstanceType(a);
				if (!t.__metadata || !t.__metadata.attrAllowMultiple)
					result = result.filter(function (a) { return !ss.isInstanceOfType(a, t); });
				result.push(a);
			}
		}
	}
	return result;
};