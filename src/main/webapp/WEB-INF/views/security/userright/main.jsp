<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%> 
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>  

<link type="text/css" rel="stylesheet" href="<c:url value="/resources/css/zTreeStyle/zTreeStyle.css" />" /> 
<script type="text/javascript" src="<c:url value="/resources/js/jquery.ztree.all-3.5.js" />"></script>

<!-- 设置编辑权限变量值 -->
<c:set value="" var="editFlag" ></c:set>
<sec:authorize access="hasRole('ROLE_ADMIN')">
	<c:set value="true" var="editFlag" ></c:set>    
</sec:authorize>

<script type="text/javascript"> 
var proPath='<c:url value="/security/userright/ryqx/" />';
var cur_ryxxid="";//主档当前ID
var goto_roleryxxid;//修改记录后定位明细ID

function showRyqx(){
	var zTreeObj;
	var setting = {		   
			   data: {
				   simpleData: {
					   enable: true,
					   idKey: "id",
					   pIdKey: "pId",
					   rootPId: 0
				   }
			   }			   
		};
	$.ajax({
	   url:proPath+cur_ryxxid,  
       type: 'GET',
       dataType:'json',
		//async:false,
       success: function (data) {    	   
	       //if(data==="[]"){	    	   
		       //alert("没有权限！");	
	       //}else{
	    	   zTreeObj = $.fn.zTree.init($("#tree"), setting, data);
	    	   zTreeObj.expandAll(true);
	       //}
       },
       error:function(xhr,st,err){            
           if($.trim(xhr.responseText).substr(0,6)=="<html>"){
               alert(xhr.responseText);    					
   		   }else
   			   alert("Status:"+xhr.status+","+xhr.responseText);   
   		   dragAsyncFlag=false;
       }
   }); 
	
}

//在jquery.jgGrid.custom.js中调用
function getRecordIdAfterEdit(objid, res){ 
	//objid为jqGrid列表的id，res为后台返回的JSON数据		
}

//编辑Form产生前初始函数
 function onInitializeFormfunc(formobj,frmoper){  
	 
 }
 
 //编辑Form产生后函数
 function editAfterShowFormFunc(formobj,frmoper){

 }
 
 //需要在通用选取后做一些事，执行nextdo()
 function nextdo(fieldid, formobj){ 	 
	 var params = {'ryxxid' : cur_ryxxid}, url='', refreshid='';	
	 if(fieldid == 'tabs-2') {
		params['roleids'] = $('#tySel_id',formobj).val();
		url='<c:url value="/security/userright/ryxxroles" />';
		refreshid='rolelist';
	 }

	 $.ajax({
		url:url, 
		data:params,
		dataType:'json',
		type: "POST",									
		async:false,
		success:function(data){ 			
			if(!authorization(data)) { 
				return;
			}  
			if(data.success){
				$("#"+refreshid).trigger('reloadGrid');									 
			} 
		},
		error:function(xhr,st,err){ 
			alert("Status:"+xhr.status+","+xhr.responseText);  
		}
	 }); 	
 }
 
 $(function(){ 
	 //调整上下帧高度及GRID的行数，在jquery.jgGrid.custom.js中实现
	 t_b_height_rownum(); 

	 //人员信息grid定义			    		 
	 $("#toplist").jqGrid({ 
		 url: '<c:url value="/security/userright/ryxxs"/>', 
		 datatype:"json",
		 colNames:['','','部门编号','部门名称','员工编号','用户名', '姓名', '性别','职称','员工状态','邮箱'], //表头
		 colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell
		   		 {name:'id', index:'id', key:true, hidden:true, editable:true},
		   		 {name:'bmxx.id', index:'bmxx.id', hidden:true, editable:true},
		   		 {name:'bmxx.bmbh', index:'bmxx.bmbh', width:55, align:"center",sortable:true,editable:true,editoptions:{size:10}}, 
		       	 {name:'bmxx.bmmc', index:'bmxx.bmmc', width:100, sortable:true,editable:true,editoptions:{size:12},editrules:{required:true}},
			     {name:'rybh', index:'rybh', width:55, align:"center", sortable:true, editable:true, editoptions:{size:10}, editrules:{required:true}},  
			     {name:'username', index:'username', width:55, align:"center", sortable:true, editable:true, editoptions:{size:20}, editrules:{required:true}},         
			     {name:'name', index:'name', width:55, align:"center", sortable:true, editable:true, editoptions:{size:10}, editrules:{required:true}}, 
			     {name:'sex', index:'sex', width:100, sortable:true, editable:true, editoptions:{value:'M:男;F:女',required:true}, formatter:'select', edittype:'select'},			       	 
			     {name:'zc', index:'zc', width:100, align:"center", sortable:false, editable:true, editoptions:{size:20}, editrules:{required:true}},
			     {name:'employed', index:'employed', align:"center", sortable:true, editable:true, editoptions:{value:'true:在职;false:离职',required:true}, formatter:'select', edittype:'select'},
			     {name:'email', index:'email', width:100, align:"center", sortable:false, editable:true, editoptions:{size:40}, editrules:{required:false}},
			     ], 
	     height: topGridHeight,   
		 rowNum: numOfTopRow, //每页记录数  
		 pager: '#toppager', //分页标签divID  
		 sortname: "bmxx.bmbh",
		 sortorder: "asc", 
		 caption:'人员信息',
		 prmNames: {rows:"size", sort:"sidx", order:"sord"},  //适应controller中Pageable解析更改（spring data）		 
		 onSelectRow:function(ids){
			 if(ids){
				 cur_ryxxid=ids;	
				 
				 //显示用户权限
				 showRyqx();	

				 //载入人员角色list
				 var v_url='<c:url value="/security/userright/ryxxroles?ryxxid="/>'+ids;
	             $("#rolelist").jqGrid('setGridParam',{url:v_url,datatype:'json'}).trigger('reloadGrid'); 	 				 					  
			 }
		 },			
		 gridComplete:function(){ 						
		    //明细list载入后定位到第一行
		    if($(this).getDataIDs().length>0){  			    
			    $(this).jqGrid('setSelection', $(this).getDataIDs()[0]);				
		    }
		} 
	 }).navGrid('#toppager',{	
		edit: false, 
		add:  false,
		del:  false,
		search:true 	 //隐藏查询功能，默认总是显示	    
	 },
	 {		
	 },
	 {	    
	 }, 
	 {		
	 });  

	 //第一个参数为jqGrid的ID,
	 //第二个参数为翻页功能条的ID
	 //第三个参数为1表示此列表不需要模糊查询，不带此参数，表示默认需要模糊查询 
	 jqGridButton("toplist", "toppager", 1);	

	 if('${editFlag}'=='true'){		 
	     $("#toplist").jqGrid('navButtonAdd','#toplist_toppager_left',{caption:'授权', title:'授权',
		     position: "first", id:"auth_toplist_top",buttonicon:'ui-icon-document',
			 onClickButton:function(){
				 var opt={title:'用户授权',
						url:'<c:url value="/security/userright/getuserfunction/'+cur_ryxxid+'"/>',
						submiturl:'<c:url value="/security/userright/saveuserfunction/'+cur_ryxxid+'" />',
						colNames:['功能名称','','',''], //表头
						colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell
						{name:'functionname', index:'functionname',width:300, sortable:false},
						{name:'enbl',index:'enbl',width:60,align:'center',editable:true,edittype:'checkbox',editoptions:{value:'1:0'},formatoptions:{disabled:false}},
						{name:'id', index:'id',key:true,hidden:true},
						{name:'idx', index:'idx',editable:true,hidden:true}						
						], 
						ExpandColumn:"functionname",
						submitparam:"id,idx",						
						oneditfunc:oneditfunc,
						afterSubmit:function(){
							//刷新用户权限
							showRyqx();
						}
					};
				dialog_treegrid(opt);
			 }});  
     }	 

	 function oneditfunc(rowid){   
		
	 }	

	 //人员角色grid定义			    		 
	 $("#rolelist").jqGrid({  
			colNames:['','','','角色编码','角色名称','创建时间'], //表头
			colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell
			        {name:'id', index:'id', key:true,hidden:true},
			        {name:'role.id', index:'role.id',hidden:true},
			       	{name:'ryxx.id', index:'ryxx.id',hidden:true},
			       	{name:'role.code', index:'role.code', width:55}, 
			       	{name:'role.name', index:'role.name', width:100},
			       	{name:'role.createTime', index:'role.createTime'} 
			       	], 
			height: bottomGridHeight+pagebarheight, //下帧高度    
			rowNum: numOfBottomRow, //每页记录数
			pager: '#rolepager', //分页标签divID  
		    hidegrid:false, 
			sortname: "id",
			sortorder: "asc", 
			multiselect: true, //多选框        
			multiboxonly: true, //在点击表格row时只支持单选，只有当点击checkbox时才多选，需要multiselect=true是有效
			onSelectRow:function(ids){ 
			      if(ids){
				        
				  }
				},			
			gridComplete:function(){ 				 
		       if($(this).getDataIDs().length>0){  //明细list载入后定位到第一行或者新增修改的那一行
			       if(goto_roleryxxid){
			    		$(this).jqGrid('setSelection',goto_roleryxxid);
			    		goto_roleryxxid=null;
				    }else{
		    	   		$(this).jqGrid('setSelection',$(this).getDataIDs()[0]);
				    }
		       }
			} 
		}).navGrid('#rolepager',{			
			    edit: Boolean(false), 
			    add: Boolean("${editFlag}"),
			    del: Boolean("${editFlag}"),		    
			    search:false 	 //隐藏查询功能，默认总是显示	    
		    },
		    {
			   
			},
		    {
				 beforeInitData:function(){			
						var condition = " d not in (select rr.role from RoleRyxx rr where rr.ryxx.id = " + cur_ryxxid + ")";		 
						$('#tabs-2')._selCommon('SE','2',true,'',condition);						
						return false;
				} 
			 }, 
		    {
				onclickSubmit:function(params,postdata){ 					
					params.url="security/userright/ryxxroles/"+cur_ryxxid+"/"+$(this).jqGrid('getGridParam','selarrrow');
		        }
		    });  
	     
	 jqGridButton("rolelist","rolepager",1);	 
	 
	 $("#tabs").tabs( //默认jquery处理显示tab对应的div层，各个div层的内容在之前已经处理好
		{collapsible:false},  
		{
	   		beforeLoad: tabBeforeLoad,   //tab载入异常处理，在jquery.jqGrid.custom.js中定义
	       	activate:function(event,ui){
           		if(ui.newTab.index()==1){
         	   		//选择某个TAB后执行动作，例如载入要显示的内容
                }
            }
		}
	  );	 

	 $("#tabs-1").height($("#tabs").height()-40);
		 
 });	 	 
</script> 

<div id="topdiv" class="chc_top_jqgrid">
	<table id="toplist" style="width:100%"><tr><td/></tr></table>
    <div id="toppager"></div>     
</div>
<div id="tabs" class="chc_tabs">
	<ul>
		<li><a href="#tabs-1">人员权限</a></li>
		<li><a href="#tabs-2">人员角色</a></li>					
	</ul>
    <div id="tabs-1" style="overflow-y:scroll;"> 
   		<ul id="tree" class="ztree"></ul>		
	</div>  
	<div id="tabs-2" > 
    	<table id="rolelist" style="width:100%"><tr><td/></tr></table>  
   		<div id="rolepager"></div>
	</div>  	    	    
</div>  	