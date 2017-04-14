<%@ page language="java" contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>    
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>  
<%@ taglib prefix="sf" uri="http://www.springframework.org/tags/form"%>

<spring:eval expression="@appProperties.getProperty('companyName')" var="companyName"/>
<jsp:useBean id="now" class="java.util.Date"/>

<script>
$(document).ready(function(){	
	$("#login_pwlist").jqGrid({ 
		data:[{xtyhid:'sss',oldyhkl:'',yhkl:'',qryhkl:''}],
		colNames:['','旧密码','新密码', '确认密码'],
		colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell
		   	{name:'xtyhid', index:'xtyhid', hidden:true,editable:true,viewable:false},  
			{name:'oldyhkl', index:'oldyhkl',editable:true,edittype:"password",editoptions:{size:24},editrules:{required:true}},
			{name:'yhkl', index:'yhkl',editable:true,edittype:"password",editoptions:{size:24},editrules:{required:true,custom:true,custom_func:rule_yhkl}},
			{name:'qryhkl', index:'qryhkl',editable:true,edittype:"password",editoptions:{size:24},editrules:{required:true,custom:true,custom_func:rule_qryhkl}},
		],			       	       	    
		rowNum: 1 //每页记录数     		
	}).closest(".ui-jqgrid-view").hide().closest(".ui-jqgrid").removeClass("ui-widget-content");
	//是将列表核心层隐藏，但最外层不隐藏仅将ui-widget-content去掉，因为整个隐藏编辑窗口位置定位有受影响
	//.closest(".ui-jqgrid").hide(); 
	//如果使用这种方式隐藏，编辑窗口上的叉“X“关闭窗口后，再点击功能按钮会没反映，需点一下其他地方，
	//且窗口垂直居中也有受影响 ，因为在窗口居中是在显示前函数中进行处理，此时高度会为0	     	
}); 

function changPassword(){
	$("#login_pwlist").jqGrid('setSelection',$("#login_pwlist").getDataIDs()[0]);	
	$("#login_pwlist").editGridRow($("#login_pwlist").jqGrid('getGridParam','selrow'),{	
		width:400,	       
	    onclickSubmit:function(params,postdata){
		    postdata._method='PUT';						
			params.url="./administrator/updpassword";					
		}
		//,beforeShowForm:null,
		//afterShowForm:editBeforeShowFormFunc//本来居中显示函数是在beforeShowForm中使用，此处由于$("#editmod"+$.jgrid.jqID(this.id))高度取不到，改在afterShowForm处理					
	});
	//$('.ui-jqdialog-titlebar-close').remove();//将编辑窗口标题上的小叉”X“去掉
	// 此三处注释是为.closest(".ui-jqgrid").hide()方式隐藏#pwlist所用，改用其他方式隐藏则不需要
}
</script> 
	
<c:url value="/main" var="mainUrl" />

<div class="logo">
	<img src="<c:url value="/resources/image/selogo.gif"/>" >
</div> 
<div class="rightdiv">
	<div class="toprightmenu" >
		<ul>
			<li><a href="<c:url value="/logout" />" >退出系统</a></li>
			<li>&nbsp;|&nbsp;</li>
			<li><a href="javascript:void(0)" onClick="changPassword(); return false;">修改密码</a></li>
			<li>&nbsp;|&nbsp;</li>							
		</ul>			
	</div>			
</div>
<div class="centerdiv" >
	<div class="userinfo">
		${name}，欢迎您！<br><fmt:formatDate value="${now}" pattern="yyyy年MM月dd日" />
	</div> 
	<div class="gsinfo">${companyName}</div>
</div>
<table id="login_pwlist" style="width:100%"><tr><td></td></tr></table>