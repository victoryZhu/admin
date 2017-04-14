<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="sf" uri="http://www.springframework.org/tags/form"%>   

<spring:eval expression="@appProperties.getProperty('appName')" var="appName"/>                     

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="Expires" CONTENT="0">
<meta http-equiv="Cache-Control" CONTENT="no-cache">
<meta http-equiv="Pragma" CONTENT="no-cache">
<title>登录页面</title>
<style>
body {
	WORD-BREAK: break-all;
	LINE-HEIGHT: 16px
	FONT: 100%/120% Helvetica, Arial, sans-serif;
	margin: 0px
}
table {
	FONT-SIZE: 12px;
	COLOR: #333333;
	LINE-HEIGHT: 16px
}
a:link {
	color: #ff0000;
}
.line1 a:link {
	color: #ABB8C6
}
a:visited {
	color: #ABB8C6
}
a:hover {
	text-decoration: underline;
	color: blue
}
input {
	FONT: 80%/100% Helvetica, Arial, sans-serif;
}
error{ 
	color:Red; 
	font-size:15px; 
	margin-left:1px; 
	padding-left:13px; 
} 
</style>
</head>
<body bgcolor="white" style="overlfow: hidden" >			
		<div>		
		<sf:form method="POST" action="syslogin" target="_top">
			<%-- <input type="hidden"	name="${_csrf.parameterName}"	value="${_csrf.token}"/> --%>			
			<TABLE cellSpacing="0" cellPadding="0" width="500" height="100%"
				align="center" border="0">
				<tr>
					<td align="center" height="280" valign="middle">
						<table width="500" height="50" align="center" cellSpacing="0"	cellPadding="0" border="0">
							<tr>								
								<td align="right" height="50" valign="bottom"  style="font-size: 14px; FONT-FAMILY: 宋体">
									${appName}&nbsp;
								</td>								
							</tr>
						</table>
						<table width="500" height="180" cellSpacing="0" cellPadding="10"
							align="center" id="all_tab" border="0" bgcolor="#F2F4F6"
							style="vertical-align: middle; border: solid #d0d0d0; border-width: 1px 1px 1px 1px;">
							<TR>
								<TD height="40" style="font-size: 22px; font-weight: bold;">S<FONT
									color="red">E</FONT></TD>
							</TR>
							<tr>
								<td id="loginLabel" height="30"
									style="font-size: 16px; color: #6C6C6C; font-weight: bold;">Log
									in to ap.yourhealth.com/admin</td>
							</tr>
							<tr>
								<td height="10"></td>
							</tr>
							<tr>
								<td id="loginMain" height="30" style="font-size: 16px;"
									valign="middle"><input type="text" name="username" placeholder="用户名" size="25" /> 
									<input type="password" name="password" placeholder="密码" size="25" /> 
									<input name="submit" type="submit"	value="登录系统" />
								</td>
							</tr>
							<c:if test="${param.error != null && SPRING_SECURITY_LAST_EXCEPTION != null}">		
							<tr>
								<td align="left" height="50"  valign="bottom"  class="error">
									<c:out	value="${SPRING_SECURITY_LAST_EXCEPTION.message}" />
								</td>
							</tr>																	
							</c:if>
							<c:if test="${param.logout != null}">
							<tr>
								<td align="left" height="50"  valign="bottom"  class="error">您已经退出系统！</td>	
							</tr>		
							</c:if>	
						</table>
						<table width="500" height="50" align="center" cellSpacing="0" cellPadding="0" border="0" bgcolor="#485156">
							<tr>
								<td align="center" valign="top" width="500">
									<TABLE cellSpacing="0" cellPadding="0" width="100%"	align="center" height="50" border="0">
										<tr>
											<td height="5"></td>
										</tr>
										<tr>
											<td height="20" align="center" style="color: white">&nbsp;&nbsp;屏幕分辨率：1024*768及以上&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;浏览器支持：IE、FireFox、Safari...</td>
										</tr>
										<tr>
											<td height="20" align="center" style="color: white">&nbsp;&nbsp;&copy;&nbsp;2014&nbsp;CHBC&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;技术支持：有限公司
											</td>
										</tr>
										<tr>
											<td height="5"></td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr>
					<td height="20%"></td>
				</tr>
			</TABLE>
		</sf:form>
	</div>
</body>
</html>