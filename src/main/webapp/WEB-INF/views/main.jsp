<%@ page language="java" contentType="text/html; charset=utf-8"  pageEncoding="utf-8"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>  

<!DOCTYPE html >
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<link type="text/css" rel="stylesheet" href="<c:url value="/resources/css/redmond/jquery-ui-1.10.4.custom.min.css" />" />
<link type="text/css" rel="stylesheet" href="<c:url value="/resources/css/layout-default-latest.css" />" />
<link type="text/css" rel="stylesheet" href="<c:url value="/resources/css/ui.jqgrid.css" />" />
<link type="text/css" rel="stylesheet" href="<c:url value="/resources/css/ui.jqgrid.custom.css" />" />

<script type="text/javascript" src="<c:url value="/resources/js/jquery-1.9.1.min.js" />" ></script>
<script type="text/javascript" src="<c:url value="/resources/js/jquery-ui-1.10.4.custom.min.js" />" ></script>
<script type="text/javascript" src="<c:url value="/resources/js/jquery-ui-timepicker-addon.min.js" />" ></script>
<script type="text/javascript" src="<c:url value="/resources/js/jquery.jqGrid.min.js" />" ></script>
<script type="text/javascript" src="<c:url value="/resources/js/i18n/grid.locale_zh_CN.js" />" ></script>
<script type="text/javascript" src="<c:url value="/resources/js/jquery.jqGrid.custom.js" />" ></script>
<script type="text/javascript" src="<c:url value="/resources/js/jquery.layout-latest.min.js" />" ></script>

<script>
$(document).ready(function () { 
	$('body').layout({ 	
		north:{
     	  spacing_open:0,
     	  size:46,
     	  },         
        west:{
      	  spacing_open:8,
      	  maxSize:180
          },
        east:{
          spacing_closed:0,
          slidable:false,
          initClosed:true,
          initHidden:true
          },
        south:{
      	  spacing_open:0,
      	  size:0
          },
   		onload_end: function(){
   			$.ajax({
				url: "<c:url value="/top" />",
				type: "GET",
				dataType: "html",
				complete : function (req, err) {
					var data=req.responseText; 
					if(data.substring(0,10)=='{"success"'){
						data=$.parseJSON(data);
						if(!authorization(data)) return;
					}
					$(".ui-layout-north").append(req.responseText); 
				}
			});
   			$.ajax({
				url: "<c:url value="/menu" />",
				type: "GET",
				dataType: "html",
				complete : function (req, err) {
					var data=req.responseText; 
					if(data.substring(0,10)=='{"success"'){
						data=$.parseJSON(data);
						if(!authorization(data)) return;
					}
					$(".ui-layout-west").append(req.responseText); 
				}
			});	
   		},
   		west__onresize:function(x, ui){     
   			var $P = $("#menu_accordion"); 
   			 $P.height(parseInt($P.parent().height())); 
   			 $P.accordion("refresh");  
       	},
       	center__onresize:function(x, ui){
       		var $w = ui.jquery ? ui : $(ui.newPanel || ui.panel);         		
       		t_b_resize($w);
       	}
	});	 
}); 
</script>
 
<title>系统管理</title>
</head>
<body>
	<DIV class="ui-layout-center"></DIV>
	<DIV class="ui-layout-north"></DIV>
	<DIV class="ui-layout-south"></DIV>
	<DIV class="ui-layout-east"></DIV>
	<DIV class="ui-layout-west"></DIV> 
</body>
</html>