//   Copyright (C) 2026 lattiahirvio
//
//   This file is part of Clojette.
//
//   Clojette is free software: you can redistribute it and/or modify
//   it under the terms of the GNU General Public License as published by
//   the Free Software Foundation, either version 3 of the License, or
//   any later version.
//
//   Clojette is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU General Public License for more details.
//
//   You should have received a copy of the GNU General Public License
//   along with Clojette. If not, see <https://www.gnu.org/licenses/>.

nativeFns = {
    "get_shell": @get_shell,
    "get_router": @get_router,
    "nslookup": @nslookup,
    "whois": @whois,
    "is_valid_ip": @is_valid_ip,
    "is_lan_ip": @is_lan_ip,
    "active_user": @active_user,
    "home_dir": @home_dir,
    "program_path": @program_path,
    "current_path": @current_path,
    "parent_path": @parent_path,
    "get_abs_path": @get_abs_path,
    "include_lib": @include_lib,
	  "yield": @yield,
    "exit": @exit,
    "wait": @wait,
    "time": @time,
    "current_date": @current_date,
    "char": @char,
    "pi": @pi,
    "rnd": @rnd,
    "val": @val,
    "slice": @slice,
    "typeof": @typeof,
	  "globals": @globals,
	  "format-columns": @format_columns,
}

for kv in nativeFns
    globalEnv.locals[kv.key] = @kv.value
    globalEnv.natives[kv.key] = true
end for

// In the future for more robust interop stuff :+1:
//makeNative = function(fn)
//    return {"classID": "native", "__tag__": @__runtimeTag__, "fn": @fn}
//end function
//
//for kv in nativeFns
//    globalEnv.locals[kv.key] = makeNative(@kv.value)
//end for
