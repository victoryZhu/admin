<%@ page language="java" contentType="text/html; charset=UTF-8"	pageEncoding="UTF-8"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title><fmt:bundle basename="message"><fmt:message key="authException.title" /></fmt:bundle></title>
</head>
<body>	
	<c:url value="/login" var="loginUrl" />
	<div align="center">
	<h3><fmt:bundle basename="message"><fmt:message key="authException.info1" /></fmt:bundle><span id="show"></span><fmt:bundle basename="message"><fmt:message key="authException.info2" /></fmt:bundle></h3>	
	<a href="${loginUrl}"  target="_top" ><fmt:bundle basename="message"><fmt:message key="authException.info3" /></fmt:bundle></a>
	</div>	
</body>
<script> 
var t=10;//设定跳转的时间，单位秒 
function refer(){ 
	if(t==0){ 
		top.location="${loginUrl}"; //设定跳转的链接地址 
	} 	
	document.getElementById('show').innerHTML=""+t;   // 显示倒计时 
	t--; // 计数器递减 	
} 

refer();
setInterval("refer()",1000); //启动1秒定时
</script> 
</html>