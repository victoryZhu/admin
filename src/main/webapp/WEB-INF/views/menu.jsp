<%@ page language="java" contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>  

<script type="text/javascript"> 
$(function(){  
	$("#menu_accordion");
	$("#menu_accordion").height(parseInt($("#menu_accordion").parent().height())); 
	$("#menu_accordion").accordion({ 
		/*autoheight:false,*/
		fillSpace:true,   //collapsible:true,
		heightStyle:"fill", //"auto",//"content",
		active:0
		});
});
 
function clickMenu(url){
	$.ajax({
		url: url,
		type: "GET",
		dataType: "html",
		complete : function (req, err) {
			var data=req.responseText;
			//if(authorization(data))
			if(data.substring(0,10)=='{"success"'){
				data=$.parseJSON(data);
				if(!authorization(data)) return;
			}
			//将返回的HTML加入center中
			$("body>.ui-layout-center").html(data); 
		}
	});
	return false;
}	
</script>

<div id="menu_accordion" class="menu_accordion" >	
	<h3>基础管理</h3>	
	<ul>				
		<li><a id="menu12" href="javascript:void(0)" onclick="clickMenu('<c:url value="/orgnization/setting" />')" >部门人员设置</a></li>
		<li><a id="menu13" href="javascript:void(0)" onclick="clickMenu('<c:url value="/deploy/system" />')">系统模块功能</a></li>
		<li><a id="menu32" href="javascript:void(0)" onclick="clickMenu('<c:url value="/common/dictionary" />')" >数据字典维护</a></li>
	</ul>			
		
	<h3>权限管理</h3>			
	<ul>
		<li><a id="menu41" href="javascript:void(0)" onclick="clickMenu('<c:url value="/security/userright" />')" >用户授权</a></li>
		<li><a id="menu42" href="javascript:void(0)" onclick="clickMenu('<c:url value="/security/roleright" />')"  >角色管理</a></li>											 
	</ul> 
	
	<h3>安全管理</h3>			
	<ul>
		<li><a id="menu31" href="javascript:void(0)" onclick="clickMenu('<c:url value="/security/syslog" />')">日志查询</a></li>
	</ul> 		
</div> 			