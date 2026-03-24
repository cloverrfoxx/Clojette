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

// This file has been minified using (Greybel)[https://github.com/ayecue/greybel-js].
// The code is available in full at https://github.com/lattiahirvio/Clojette
// This file is meant for distribution, and not development.
// To change the code, download the files from GitHub, and work on those.

globals.I=globals
I.Ч=null
I.Т="classID"
I.У="error"
I.Ф="__tag__"
I.Э="message"
I.Ц=""""
I.Х="trace"
I.Я="fn"
I.Ь="args"
I.Ю="in "
I.Ы="recur"
I.Ш=")"
I.Щ="array"
I.и="quote"
I.й="set!"
I.Ъ="macros"
I.н="apply"
I.з="let"
I.д="do"
I.е="if"
I.б="__namespaces__"
I.в="__ns_aliases__"
I.а="__current_ns__"
I.ж="def"
I.м=""
I.к="__gensym_counter__"
I.г="user"
I.л="Division by zero"
J=function
end function
K=function(h)
if h==Ч then return {Т:У,Ф:@J,Э:"Null"}
return {Т:У,Ф:@J,Э:h}
end function
ϫ=function(t)
if @t isa number then return t
if @t isa funcRef then return K("Tried evaluating funcRef as an atom?")
if t[0]==Ц then return t
x=t.val
if str(x)==t then return x
return t
end function
M=function(val)
if not @val isa map then return 0
if @val.hasIndex(Т) and @val[Т]==У then
if not @val.hasIndex(Ф) then return 0
return @val[Ф]==@J
end if
return 0
end function
N=function(k,g)
if not k.hasIndex(Х) then k[Х]=[]
k[Х].push(g)
return k
end function
O=function(val)
if not @val isa map then return 0
if not val.hasIndex(Ф) then return 0
return @val[Ф]==@J
end function
P=function(l,m,name,Н=0)
if M(@l) then return @l
if @l isa map then
if l.hasIndex(Т) and l[Т]==Я then
while 1
o=W(l[Ь],m,l["env"])
if M(@o) then return o
ϴ=Ч
for p in l["body"]
ϴ=U(p,o)
if M(@ϴ) then return N(@ϴ,Ю+name)
end for
if ϴ isa map and ϴ.hasIndex(Т) and ϴ[Т]==Ы then
m=ϴ[Ь]
else
return ϴ
end if
end while
end if
end if
if @l isa funcRef or typeof(@l)=="function" then
if Н then
if m.len==0 then return @l
if m.len==1 then return @l(m[0])
if m.len==2 then return @l(m[0],m[1])
if m.len==3 then return @l(m[0],m[1],m[2])
if m.len==4 then return @l(m[0],m[1],m[2],m[3])
if m.len==5 then return @l(m[0],m[1],m[2],m[3],m[4])
return K("Native functions support at most 5 arguments")
else
return l(@m)
end if
end if
return K("Not a function: "+name)
end function
Q=function(q,r)
if not @q isa list then return q
if @q.len==0 then return q
if q[0]=="unquote" then
ϴ=U(q[1],r)
if M(@ϴ) then return ϴ
return ϴ
end if
ϴ=[]
for s in range(0,q.len-1)
u=q[s]
if u isa list and u.len>0 and u[0]=="splice-unquote" then
v=U(u[1],r)
if M(@v) then return v
if not @v isa list then return K("splice-unquote requires a list, got: "+typeof(@v))
if v.len>0 then
for w in range(0,v.len-1)
ϴ.push(v[w])
end for
end if
else
u=Q(@u,r)
if M(@u) then return u
ϴ.push(@u)
end if
end for
return ϴ
end function
R=function(y)
z=[]
s=0
while s<y.len
_=y[s]
if _==Ц then
ϩ=_
s=s+1
while s<y.len and y[s]!=Ц
if y[s]=="\" then
ϩ=ϩ+y[s]
s=s+1
if s<y.len then ϩ=ϩ+y[s]
else
ϩ=ϩ+y[s]
end if
s=s+1
end while
if s>=y.len then
z.push(K("Unterminated string literal: "+ϩ))
return z
end if
ϩ=ϩ+Ц
z.push(ϩ)
else if _=="(" or _==Ш or _=="[" or _=="]" then
z.push(_)
else if _=="~" then
if s+1<y.len and y[s+1]=="@" then
z.push("~@")
s=s+1
else
z.push("~")
end if
else if _=="'" or _=="`" then
z.push(_)
else if _==" " or _==char(9) or _==char(10) or _==char(13) then
else if _==";" then
while s<y.len and y[s]!=char(10)
s=s+1
end while
else
ϩ=_
while s+1<y.len and " ()[]{}""';`,".indexOf(y[s+1])==Ч
s=s+1
ϩ=ϩ+y[s]
end while
z.push(ϩ.trim)
end if
s=s+1
end while
return z
end function
S=function(z)
if z.len==0 then return K("Unexpected EOF")
if not @z isa list then return K("Not a list")
t=z.pull
if t=="(" then
Ϫ=[]
while z.len>0 and z[0]!=Ш
u=S(z)
if M(@u) then return u
Ϫ.push(u)
end while
if z.len==0 then return K("Unexpected EOF while reading list")
z.pull
return Ϫ
else if t=="[" then
Ϫ=[]
while z.len>0 and z[0]!="]"
u=S(z)
if M(@u) then return u
Ϫ.push(u)
end while
if z.len==0 then return K("Unexpected EOF while reading vector")
z.pull
return [Щ]+Ϫ
else if t==Ш then
return K("Unexpected )")
else if t=="]" then
return K("Unexpected ]")
else if t=="'" then
Ϭ=S(z)
if M(@Ϭ) then return Ϭ
return [и,Ϭ]
else if t=="`" then
Ϭ=S(z)
if M(@Ϭ) then return Ϭ
return ["quasiquote",Ϭ]
else if t=="~@" then
Ϭ=S(z)
if M(@Ϭ) then return Ϭ
return ["splice-unquote",Ϭ]
else if t=="~" then
Ϭ=S(z)
if M(@Ϭ) then return Ϭ
return ["unquote",Ϭ]
else
return ϫ(t)
end if
end function
T=function(code)
z=R(code)
ϴ=S(z)
if M(@ϴ) then return ϴ
if z.len>0 then return K("Unexpected trailing tokens: "+z.join(" "))
return ϴ
end function
U=function(q,r)
if @q isa number then return q
if @q==Ч then return Ч
if @q isa list then
if q.len==0 then return q
ϭ=q[0]
if ϭ=="quasiquote" then
return Q(q[1],r)
end if
if ϭ isa string and ϭ[0]=="." then
Ϯ=ϭ[1:]
ϯ=U(q[1],r)
if @ϯ==Ч then return K("null object in interop call ."+Ϯ)
if M(@ϯ) then return N(@ϯ,Ю+ϭ)
ϰ=@ϯ[Ϯ]
if not (@ϰ isa funcRef) then return @ϰ
m=[]
if q.len>2 then
for s in range(2,q.len-1)
ϴ=U(q[s],r)
if M(@ϴ) then return @ϴ
m.push(@ϴ)
end for
end if
if m.len==0 then return ϰ(@ϯ)
if m.len==1 then return ϰ(@ϯ,m[0])
if m.len==2 then return ϰ(@ϯ,m[0],m[1])
if m.len==3 then return ϰ(@ϯ,m[0],m[1],m[2])
if m.len==4 then return ϰ(@ϯ,m[0],m[1],m[2],m[3])
return K("Too many arguments for native method")
end if
if ϭ==Щ then
ϴ=[]
if q.len>1 then
for s in range(1,q.len-1)
val=U(q[s],r)
if M(@val) then return val
ϴ.push(val)
end for
end if
return ϴ
end if
if ϭ=="import" then
path=q[1]
if path[0]==Ц then path=path[1:-1]
ϱ=get_shell.host_computer
ϲ=get_abs_path(path)
ϳ=ϱ.File(ϲ)
if ϳ==Ч then return K("Error: file not found: "+path)
if ϳ.is_binary then return K("Error: cannot import binary file: "+path)
ϵ=ϳ.get_content
if ϵ==Ч then return K("Error: no read permission: "+path)
϶="(do "+ϵ+Ш
ϴ=T(϶)
if M(@ϴ) then return ϴ
return U(ϴ,r)
end if
if ϭ==й then
name=q[1]
d=U(q[2],r)
if M(@d) then return d
return r.setExisting(name,d)
end if
if Y.locals[Ъ].hasIndex(ϭ) then
ϸ=Y.locals[Ъ][ϭ]
Ϲ=ϸ(q[1:])
Ϻ=U(Ϲ,r)
if M(@Ϻ) then return Ϻ
return Ϻ
end if
if ϭ=="defmacro" then
name=q[1]
ϻ=q[2]
if ϻ isa list and ϻ.len>0 and ϻ[0]==Щ then
ϻ=ϻ[1:]
end if
ϼ=q[3]
Ͻ=r
ϸ=function(Ў)
Џ=ϻ
А=ϼ
Б=Ͻ
o=V(Б)
if Џ.len>0 and Ў.len>0 then
for s in range(0,Џ.len-1)
if Џ[s]=="&" then
В=Џ[s+1]
if s>=Ў.len then
o.set(В,[])
else
o.set(В,Ў[s:])
end if
break
end if
if s>=Ў.len then
o.set(Џ[s],Ч)
else
o.set(Џ[s],Ў[s])
end if
end for
end if
return U(А,o)
end function
Y.locals[Ъ][name]=@ϸ
return name
end if
if ϭ==Ы then
m=[]
if q.len>1 then
for s in range(1,q.len-1)
ϴ=U(q[s],r)
if M(ϴ) then return ϴ
m.push(ϴ)
end for
end if
return {Т:Ы,Ь:m}
end if
if ϭ=="try" then
ϼ=q[1]
ϴ=U(ϼ,r)
if M(@ϴ) then
if q.len<3 then return ϴ
Ͼ=q[2]
Ͽ=Ͼ[1]
if Ͽ isa list and Ͽ.len>0 and Ͽ[0]==Щ then
Ͽ=Ͽ[1:]
end if
Ѐ=V(r)
if Ͽ.len>0 then
Ѐ.set(Ͽ[0],ϴ[Э])
end if
return U(Ͼ[2],Ѐ)
end if
return ϴ
end if
if ϭ=="throw" then
h=U(q[1],r)
if M(h) then return h
return K(h)
end if
if ϭ==н then
ϰ=U(q[1],r)
Ђ=U(q[2],r)
if M(@ϰ) then return ϰ
if M(@Ђ) then return Ђ
if not @Ђ isa list then return K("Apply requires a list as second argument")
Н=Y.natives.hasIndex(q[1])
Ϻ=P(@ϰ,@Ђ,@q[1],Н)
if M(@Ϻ) then return N(@Ϻ,Ю+ϭ)
return Ϻ
end if
if ϭ=="and" then
ϴ=1
if q.len>1 then
for s in range(1,q.len-1)
ϴ=U(q[s],r)
if M(@ϴ) then return ϴ
if not ϴ then return ϴ
end for
end if
return ϴ
end if
if ϭ=="or" then
if q.len==1 then return Ч
for s in range(1,q.len-1)
ϴ=U(q[s],r)
if M(@ϴ) then return ϴ
if ϴ then return ϴ
end for
return 0
end if
if ϭ==и then
return q[1]
end if
if ϭ==з then
Ѓ=q[1]
if Ѓ isa list and Ѓ.len>0 and Ѓ[0]==Щ then
Ѓ=Ѓ[1:]
end if
ϼ=q[2]
o=V(r)
if Ѓ.len>0 then
for s in range(0,Ѓ.len-1,2)
d=U(Ѓ[s+1],o)
if M(@d) then return d
o.set(Ѓ[s],d)
end for
end if
return U(ϼ,o)
end if
if ϭ==д then
ϴ=Ч
if q.len>1 then
for s in range(1,q.len-1)
ϴ=U(q[s],r)
if M(@ϴ) then return ϴ
end for
end if
return ϴ
end if
if ϭ==е then
Є=U(q[1],r)
if M(@Є) then return Є
if @Є then
return U(q[2],r)
else
if q.len>3 then return U(q[3],r)
return Ч
end if
end if
if ϭ=="ns" then
Ѕ=q[1]
if Ѕ isa list then Ѕ=q[1][1]
І=Y.locals[б]
if not І.hasIndex(Ѕ) then
І[Ѕ]={}
Y.locals[в][Ѕ]={}
end if
Y.locals[а]=Ѕ
return Ѕ
end if
if ϭ==ж or ϭ=="define" then
name=q[1]
d=U(q[2],r)
if M(@d) then return d
Ї=Y.locals[а]
Y.locals[б][Ї][name]=@d
r.set(name,d)
return d
end if
if ϭ==Я then
params=q[1]
if params isa list and params.len>0 and params[0]==Щ then
params=params[1:]
end if
return {Т:Я,Ь:params,"body":q[2:],"env":r}
end if
l=U(ϭ,r)
if M(@l) then return l
m=[]
if q.len>1 then
for s in range(1,q.len-1)
val=U(q[s],r)
if M(@val) then return val
m.push(@val)
end for
end if
Н=Y.natives.hasIndex(ϭ)
Ϻ=P(@l,@m,@ϭ,Н)
if M(@Ϻ) then return N(@Ϻ," in "+ϭ)
return Ϻ
else if @q isa string then
if q[0]==":" then return q
if q[0]==Ц then return q[1:-1]
if q.indexOf("/")!=Ч then
Ј=q.split("/")
if Ј.len==2 and Ј[0]!=м and Ј[1]!=м then
Љ=Ј[0]
Њ=Ј[1]
Ї=Y.locals[а]
Ћ=Y.locals[в][Ї]
if Ћ.hasIndex(Љ) then
Ќ=Ћ[Љ]
else
Ќ=Љ
end if
І=Y.locals[б]
if not І.hasIndex(Ќ) then return K("No such namespace: "+Ќ)
if not І[Ќ].hasIndex(Њ) then return K("No such var: "+q)
return @І[Ќ][Њ]
end if
end if
return r.get(@q)
else
return q
end if
end function
V=function(Г)
Д={}
Д.locals={}
Д.get=function(name)
if self.locals.hasIndex(name) then return @self.locals[name]
if Г!=Ч then return Г.get(name)
return K("Undefined in the env: "+name)
end function
Д.set=function(name,d)
self.locals[name]=@d
end function
Д.setExisting=function(name,d)
if self.locals.hasIndex(name) then
self.locals[name]=d
return @d
end if
if Г!=Ч then return Г.setExisting(name,@d)
return K("Cannot set! undefined variable: "+name)
end function
return Д
end function
W=function(ϻ,params,Ж)
o=V(Ж)
if ϻ.len==0 then
if params.len>0 then
return K("Wrong number of args: expected 0, got "+params.len)
end if
return o
end if
З=Ч
for s in range(0,ϻ.len-1)
if ϻ[s]=="&" then
З=s
break
end if
end for
if З!=Ч then
if params.len<З then
return K("Wrong number of args: expected at least "+З+", got "+params.len)
end if
for s in range(0,З-1)
o.set(ϻ[s],params[s])
end for
В=ϻ[З+1]
if З>=params.len then
o.set(В,[])
else
o.set(В,params[З:])
end if
else
if params.len!=ϻ.len then
return K("Wrong number of args: expected "+ϻ.len+", got "+params.len)
end if
for s in range(0,ϻ.len-1)
o.set(ϻ[s],params[s])
end for
end if
return o
end function
X={}
Y=V(Ч)
Y.locals["__recur_sentinel__"]={Т:Ы,Ь:Ч}
Y.locals[к]=0
Y.locals[Ъ]={}
Y.locals[б]={г:{}}
Y.locals[а]=г
Y.locals[в]={г:{}}
Y.natives={}
a={"get_shell":@get_shell,"get_router":@get_router,"nslookup":@nslookup,"whois":@whois,"is_valid_ip":@is_valid_ip,"is_lan_ip":@is_lan_ip,"active_user":@active_user,"home_dir":@home_dir,"program_path":@program_path,"current_path":@current_path,"parent_path":@parent_path,"include_lib":@include_lib,"yield":@yield,"exit":@exit,"wait":@wait,"time":@time,"current_date":@current_date,"char":@char,"pi":@pi,"rnd":@rnd,"val":@val,"slice":@slice,"typeof":@typeof,"globals":@I,"format-columns":@format_columns}
for b in a
Y.locals[b.key]=@b.value
Y.natives[b.key]=1
end for
Y.locals[д]=д
Y.locals[е]=е
Y.locals[ж]=ж
Y.locals[Я]=Я
Y.locals[з]=з
Y.locals[и]=и
Y.locals[й]=й
Y.locals["gensym"]=function(m)
И="G__"
if m.len>0 then И=m[0]
Й=Y.locals[к]+1
Y.locals[к]=Й
return И+Й
end function
Y.locals["+"]=function(m)
sum=0
if m.len==0 then return 0
for s in range(0,m.len-1)
sum=sum+m[s]
end for
return sum
end function
Y.locals["-"]=function(m)
if m.len==0 then return K("- requires at least 1 argument")
if m.len==1 then return -m[0]
ϴ=m[0]
if m.len>1 then
for s in range(1,m.len-1)
ϴ=ϴ-m[s]
end for
end if
return ϴ
end function
Y.locals["*"]=function(m)
К=1
if m.len==0 then return 1
for s in range(0,m.len-1)
К=К*m[s]
end for
return К
end function
Y.locals["/"]=function(m)
if m.len==0 then return K("/ requires at least 1 argument")
if m.len==1 then
if m[0]==0 then return K(л)
return 1/m[0]
end if
ϴ=m[0]
for s in range(1,m.len-1)
if m[s]==0 then return K(л)
ϴ=ϴ/m[s]
end for
return ϴ
end function
Y.locals["%"]=function(m)
if m.len!=2 then return K("% requires exactly 2 arguments")
if m[1]==0 then return K("Modulo by zero")
return m[0]%m[1]
end function
Y.locals["mod"]=function(m)
if m.len!=2 then return K("mod requires exactly 2 arguments")
if m[1]==0 then return K("Modulo by zero")
return m[0]%m[1]
end function
Y.locals["**"]=function(m)
if m.len!=2 then return K("** requires exactly 2 arguments")
return m[0]^m[1]
end function
Y.locals["quot"]=function(m)
if m.len!=2 then return K("quot requires exactly 2 arguments")
if m[1]==0 then return K(л)
return floor(m[0]/m[1])
end function
Y.locals["="]=function(m)
if m.len<2 then return K("= requires at least 2 arguments")
for s in range(1,m.len-1)
if m[s]!=m[0] then return 0
end for
return 1
end function
Y.locals["not="]=function(m)
if m.len!=2 then return K("not= requires exactly 2 arguments")
return m[0]!=m[1]
end function
Y.locals["<"]=function(m)
if m.len<2 then return K("< requires at least 2 arguments")
for s in range(1,m.len-1)
if m[s-1]>=m[s] then return 0
end for
return 1
end function
Y.locals[">"]=function(m)
if m.len<2 then return K("> requires at least 2 arguments")
for s in range(1,m.len-1)
if m[s-1]<=m[s] then return 0
end for
return 1
end function
Y.locals["<="]=function(m)
if m.len<2 then return K("<= requires at least 2 arguments")
for s in range(1,m.len-1)
if m[s-1]>m[s] then return 0
end for
return 1
end function
Y.locals[">="]=function(m)
if m.len<2 then return K(">= requires at least 2 arguments")
for s in range(1,m.len-1)
if m[s-1]<m[s] then return 0
end for
return 1
end function
Y.locals["not"]=function(m)
if m.len!=1 then return K("not requires exactly 1 argument")
return not m[0]
end function
Y.locals["list"]=function(m)
if m==Ч then return K("Args for list is null!")
return []+m
end function
Y.locals["car"]=function(m)
if m.len!=1 then return K("car requires exactly 1 argument")
Л=m[0]
if Л==Ч or Л.len==0 then return K("car called on empty list")
return Л[0]
end function
Y.locals["cdr"]=function(m)
if m.len!=1 then return K("cdr requires exactly 1 argument")
Л=m[0]
if Л==Ч or Л.len==0 then return []
if Л.len==1 then return []
return Л[1:]
end function
Y.locals["cons"]=function(m)
if m.len!=2 then return K("cons requires exactly 2 arguments")
if m[1]==Ч then return [m[0]]
return [m[0]]+m[1]
end function
Y.locals["first"]=function(m)
if m.len!=1 then return K("first requires exactly 1 argument")
Л=m[0]
if Л==Ч or Л.len==0 then return Ч
return Л[0]
end function
Y.locals["second"]=function(m)
if m.len!=1 then return K("second requires exactly 1 argument")
Л=m[0]
if Л==Ч or Л.len<2 then return Ч
return Л[1]
end function
Y.locals["rest"]=function(m)
if m.len!=1 then return K("rest requires exactly 1 argument")
Л=m[0]
if Л==Ч or Л.len<=1 then return []
return Л[1:]
end function
Y.locals["conj"]=function(m)
if m.len<2 then return K("conj requires at least 2 arguments")
ϴ=m[0]
if ϴ==Ч then ϴ=[]
if m.len>1 then
for s in range(1,m.len-1)
ϴ=ϴ+[m[s]]
end for
end if
return ϴ
end function
Y.locals["concat"]=function(m)
ϴ=[]
if m.len==0 then return ϴ
for s in range(0,m.len-1)
if m[s]!=Ч then ϴ=ϴ+m[s]
end for
return ϴ
end function
Y.locals["empty?"]=function(m)
if M(m) then return m
if m.len!=1 then return K("empty? requires exactly 1 argument")
Л=m[0]
if Л==Ч then return 1
return Л.len==0
end function
Y.locals["count"]=function(m)
if m.len!=1 then return K("count requires exactly 1 argument")
if m[0]==Ч then return 0
return m[0].len
end function
Y.locals["list?"]=function(m)
if m.len!=1 then return K("list? requires exactly 1 argument")
return m[0] isa list
end function
Y.locals["nth"]=function(m)
if m.len!=2 then return K("nth requires exactly 2 arguments")
Л=m[0]
М=m[1]
if Л==Ч or М>=Л.len then return K("nth index out of bounds")
return Л[М]
end function
Y.locals["get"]=function(m)
if m.len<2 then return K("get requires at least 2 arguments")
О=m[0]
Ϩ=m[1]
if О==Ч then return Ч
if not О.hasIndex(Ϩ) then
if m.len==3 then return m[2]
return Ч
end if
return @О[Ϩ]
end function
Y.locals["hash-map"]=function(m)
ϴ={}
if m.len==0 then return ϴ
if m.len%2!=0 then return K("hash-map requires even number of arguments")
for s in range(0,m.len-1,2)
ϴ[m[s]]=@m[s+1]
end for
return ϴ
end function
Y.locals["assoc"]=function(m)
if m.len<3 then return K("assoc requires at least 3 arguments")
ϴ={}
if m[0]!=Ч then
for b in m[0]
ϴ[b.key]=@b.value
end for
end if
if m.len>1 then
for s in range(1,m.len-1,2)
ϴ[m[s]]=@m[s+1]
end for
end if
return ϴ
end function
Y.locals["dissoc"]=function(m)
if m.len<2 then return K("dissoc requires at least 2 arguments")
ϴ={}
for b in m[0]
ϴ[b.key]=@b.value
end for
if m.len>1 then
for s in range(1,m.len-1)
ϴ.remove(m[s])
end for
end if
return ϴ
end function
Y.locals["keys"]=function(m)
if m.len!=1 then return K("keys requires exactly 1 argument")
if m[0]==Ч then return []
ϴ=[]
for b in m[0]
ϴ.push(b.key)
end for
return ϴ
end function
Y.locals["vals"]=function(m)
if m.len!=1 then return K("vals requires exactly 1 argument")
if m[0]==Ч then return []
ϴ=[]
for b in m[0]
ϴ.push(@b.value)
end for
return ϴ
end function
Y.locals["map?"]=function(m)
if m.len!=1 then return K("map? requires exactly 1 argument")
return m[0] isa map
end function
Y.locals["contains?"]=function(m)
if m.len!=2 then return K("contains? requires exactly 2 arguments")
if m[0]==Ч then return 0
return m[0].hasIndex(m[1])
end function
Y.locals["number?"]=function(m)
if m.len!=1 then return K("number? requires exactly 1 argument")
return m[0] isa number
end function
Y.locals["string?"]=function(m)
if m.len!=1 then return K("string? requires exactly 1 argument")
return m[0] isa string
end function
Y.locals["null?"]=function(m)
if m.len!=1 then return K("null? requires exactly 1 argument")
return m[0]==Ч
end function
Y.locals["fn?"]=function(m)
if m.len!=1 then return K("fn? requires exactly 1 argument")
if m[0] isa funcRef then return 1
return m[0] isa map and m[0].hasIndex(Т) and m[0][Т]==Я
end function
Y.locals["true?"]=function(m)
if m.len!=1 then return K("true? requires exactly 1 argument")
return m[0]==1
end function
Y.locals["false?"]=function(m)
if m.len!=1 then return K("false? requires exactly 1 argument")
return m[0]==0
end function
Y.locals["floor"]=function(m)
if m.len!=1 then return K("floor requires exactly 1 argument")
return floor(m[0])
end function
Y.locals["ceil"]=function(m)
if m.len!=1 then return K("ceil requires exactly 1 argument")
return ceil(m[0])
end function
Y.locals["round"]=function(m)
if m.len!=1 then return K("round requires exactly 1 argument")
return round(m[0])
end function
Y.locals["abs"]=function(m)
if m.len!=1 then return K("abs requires exactly 1 argument")
return abs(m[0])
end function
Y.locals["sqrt"]=function(m)
if m.len!=1 then return K("sqrt requires exactly 1 argument")
return sqrt(m[0])
end function
Y.locals["max"]=function(m)
if m.len<1 then return K("max requires at least 1 argument")
ϴ=m[0]
if m.len>1 then
for s in range(1,m.len-1)
if m[s]>ϴ then ϴ=m[s]
end for
end if
return ϴ
end function
Y.locals["min"]=function(m)
if m.len<1 then return K("min requires at least 1 argument")
ϴ=m[0]
if m.len>1 then
for s in range(1,m.len-1)
if m[s]<ϴ then ϴ=m[s]
end for
end if
return ϴ
end function
Y.locals["str"]=function(m)
ϴ=м
if m.len==0 then return ϴ
for s in range(0,m.len-1)
ϴ=ϴ+str(m[s])
end for
return ϴ
end function
Y.locals["split"]=function(m)
if m.len!=2 then return K("split requires exactly 2 arguments")
return m[0].split(m[1])
end function
Y.locals["join"]=function(m)
if @m.len!=2 then return K("join requires exactly 2 arguments")
if typeof(@m)!="list" then return K("Expected a list, got "+typeof(@m))
return m[0].join(m[1])
end function
Y.locals["trim"]=function(m)
if m.len!=1 then return K("trim requires exactly 1 argument")
return m[0].trim
end function
Y.locals["index-of"]=function(m)
if m.len!=2 then return K("index-of requires exactly 2 arguments")
return m[0].indexOf(m[1])
end function
Y.locals["subs"]=function(m)
if m.len<2 then return K("subs requires at least 2 arguments")
if m.len==2 then return m[0][m[1]:]
return m[0][m[1]:m[2]]
end function
Y.locals["upper-case"]=function(m)
if m.len!=1 then return K("upper-case requires exactly 1 argument")
return m[0].upper
end function
Y.locals["lower-case"]=function(m)
if m.len!=1 then return K("lower-case requires exactly 1 argument")
return m[0].lower
end function
Y.locals["replace"]=function(m)
if m.len!=3 then return K("replace requires exactly 3 arguments")
П=m[0]
Р=m[1]
С=m[2]
if Р==м then return K("replace: needle cannot be empty")
return П.replace(Р,С)
end function
Y.locals["println"]=function(m)
if m.len==0 then
print(м)
return Ч
end if
Ј=[]
for s in range(0,m.len-1)
Ј.push(str(@m[s]))
end for
print(Ј.join(" "))
return Ч
end function
Y.locals["user-input"]=function(m)
if m.len>0 then return user_input(m[0])
return user_input(м)
end function
Y.locals[н]=function(m)
if m.len!=2 then return K("apply requires exactly 2 arguments")
ϰ=@m[0]
Ђ=m[1]
if not Ђ isa list then return K("apply requires a list as second argument")
return P(@ϰ,Ђ,н)
end function
Y.locals["take-keys"]=function(m)
Ѓ=m[0]
if Ѓ isa list and Ѓ.len>0 and Ѓ[0]==Щ then
Ѓ=Ѓ[1:]
end if
ϴ=[]
for s in range(0,Ѓ.len-1,2)
ϴ.push(Ѓ[s])
end for
return ϴ
end function
Y.locals["take-vals"]=function(m)
Ѓ=m[0]
if Ѓ isa list and Ѓ.len>0 and Ѓ[0]==Щ then
Ѓ=Ѓ[1:]
end if
ϴ=[]
for s in range(1,Ѓ.len-1,2)
ϴ.push(Ѓ[s])
end for
return ϴ
end function
Y.locals["true"]=1
Y.locals["false"]=0
Y.locals["null"]=Ч
Y.locals["nil"]=Ч
while 1
Е=user_input("Clojette> ")
if Е=="exit" or Е=="quit" or Е=="q" then break
ϴ=U(T(Е),Y)
if M(@ϴ) then
print("ERROR: "+ϴ[Э])
if ϴ.hasIndex(Х) and ϴ[Х].len>0 then
for g in ϴ[Х]
print(g)
end for
end if
else
print(ϴ)
end if
end while
