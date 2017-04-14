<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>错误页面</title>
<% System.err.println("http 403，访问拒绝"); %>
<style>
<!--
H1 {
	font-family: Tahoma, Arial, sans-serif;
	color: white;
	background-color: #525D76;
	font-size: 22px;
}

H2 {
	font-family: Tahoma, Arial, sans-serif;
	color: white;
	background-color: #525D76;
	font-size: 16px;
}

H3 {
	font-family: Tahoma, Arial, sans-serif;
	color: white;
	background-color: #525D76;
	font-size: 14px;
}

BODY {
	font-family: Tahoma, Arial, sans-serif;
	color: black;
	background-color: white;
}

B {
	font-family: Tahoma, Arial, sans-serif;
	color: white;
	background-color: #525D76;
}

P {
	font-family: Tahoma, Arial, sans-serif;
	background: white;
	color: black;
	font-size: 12px;
}

A {
	color: black;
}

A.name {
	color: black;
}

HR {
	color: #525D76;
}
-->
</style>
</head>
<body>
	<h1>HTTP Status 403 - 访问拒绝</h1>
	<HR size="1" noshade="noshade">
	<p>
		<b>类型</b> 状态报告
	</p>
	<p>
		<b>消息</b> <u>访问被拒绝</u>
	</p>
	<p>
		<b>描述</b> <u>试图访问未授权的资源，访问被拒绝，请与管理员联系。</u>
	</p>
	<HR size="1" noshade="noshade">
	<h3>嘉新集团系统管理</h3>
</body>
</html>