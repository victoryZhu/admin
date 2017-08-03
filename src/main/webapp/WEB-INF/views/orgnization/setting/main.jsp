<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%> 
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>  
<%--部门人员设置--%>

<!-- 设置编辑权限变量值 -->
<c:set value="" var="editFlag" ></c:set>
<sec:authorize access="hasRole('ROLE_ADMIN')">
	<c:set value="true" var="editFlag" ></c:set>    
</sec:authorize>

<script type="text/javascript"> 
var cur_bmxxid="";//主档当前ID
var goto_bmxxid;//修改记录后定位主档ID
var goto_ryxxid;//修改记录后定位明细ID 

//定位，在jquery.jgGrid.custom.js中调用
function getRecordIdAfterEdit(objid, res){ 
	//objid为jqGrid列表的id，res为后台返回的JSON数据	
	if(objid=="toplist") 
		goto_bmxxid=res.key_id;
    else if(objid=="mxlist") 
        goto_ryxxid=res.key_id;
	else if(objid=="pwlist") {  
		//修改密码后定位  	
		goto_ryxxid = res.key_id; 
		//修改密码后，因为内容没有发生变化（密码不显示），mxlist不需要重新载入
        //$("#mxlist").trigger('reloadGrid');
    } 
}

//明细新增提交前赋值
function mxaddBeforeSubmit(postdata, formid){
	 postdata['bmxx.id']= cur_bmxxid;	 
 	 return [true,'']; 
}

//部门编辑前
function topedit(tableid){	
	//变换表单布局，默认为一列多行，当字段较多时，在此处可以作一些变换，变成多列多行。
			
}

//人员编辑前
function ryxxEdit(tableid,frmoper){	
	//新增时有密码栏位，修改时没有
	$(this).setColProp('password',{editable:frmoper=='add'?true:false}); 
	$(this).setColProp('password1',{editable:frmoper=='add'?true:false});  	
} 

//编辑Form产生前初始函数
 function onInitializeFormfunc(formobj,frmoper){  
	 
 }
 
 //编辑Form产生后函数
 function editAfterShowFormFunc(formobj,frmoper){

 }
 
 //需要在通用选取后做一些事，执行nextdo()
 function nextdo(fieldid,formobj){ 
	
 }
 
 $(function(){ 
	 //调整上下帧高度及GRID的行数，在jquery.jgGrid.custom.js中实现
	 t_b_height_rownum(); 

	 //明细grid定义			    		 
	 $("#mxlist").jqGrid({ 
 	     colNames:['','员工编号','用户名', '姓名', '性别','职称','员工状态','邮箱','用户密码','确认密码',''], //表头
		 colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell
		   		 {name:'id', index:'id', key:true, hidden:true, editable:true},
			     {name:'rybh', index:'rybh', width:60, align:"center", sortable:true, editable:true, editoptions:{size:10}, editrules:{required:true}},  
			     {name:'username', index:'username', width:60, align:"center", sortable:true, editable:true, editoptions:{size:20}, editrules:{required:true}},        
			     {name:'name', index:'name', width:60, align:"center", sortable:true, editable:true, editoptions:{size:10}, editrules:{required:true}}, 
			     {name:'sex', index:'sex', align:"center", width:40, sortable:true, editable:true, editoptions:{value:'M:男;F:女',required:true}, formatter:'select', edittype:'select'},			       	 
			     {name:'zc', index:'zc', width:100, align:"center", sortable:false, editable:true, editoptions:{size:20}, editrules:{required:true}},
			     {name:'employed', index:'employed', width:60, align:"center", sortable:true, editable:true, editoptions:{value:'true:在职;false:离职',required:true}, formatter:'select', edittype:'select'},
			     {name:'email', index:'email', width:120, align:"center", sortable:false, editable:true, editoptions:{size:40}, editrules:{required:false}},
			     {name:'password', index:'password',hidden:true,editable:true,edittype:"password",editrules:{edithidden:true,required : true, custom : true, custom_func:rule_yhkl},viewable:false},
			     {name:'password1', index:'passwordl',hidden:true,editable:true,edittype:"password",editrules:{edithidden:true,required : true, custom : true, custom_func:rule_qryhkl},viewable:false},
			     {name:'bmxx.id', index:'bmxx.id', hidden:true, editable:true}], 
		 height: bottomGridHeight, //下帧高度    
		 rowNum: numOfBottomRow, //每页记录数
		 pager: '#mxpager', //分页标签divID  
		 sortname: "rybh",
		 sortorder: "asc", 
		 multiselect: false, //多选框        
		 multiboxonly: false, //在点击表格row时只支持单选，只有当点击checkbox时才多选，需要multiselect=true是有效
		 prmNames: {rows:"size", sort:"sidx", order:"sord"},  //适应controller中Pageable解析更改（spring data）
		 onSelectRow:function(ids){
			 if(ids){
				 //设置密码列表第一行id的值为ids，修改密码页面会用到 	
				 $("#pwlist" ).setRowData(  "1" , { ryxxid: ids }); 					  
			 }
		 },			
		 gridComplete:function(){ 					    	
		    if($(this).getDataIDs().length>0){
			    //有记录时，修改和修改密码按钮才显示
		    	$("#edit_mxlist_top").show(); 			 
				$("#xgmm_mxlist_top").show(); 

				//明细list载入后定位到第一行或者新增修改的那一行    
			    if(goto_ryxxid){
				    $(this).jqGrid('setSelection', goto_ryxxid);
			    	goto_ryxxid=null;
				}else{
		    		$(this).jqGrid('setSelection', $(this).getDataIDs()[0]);
				}
		    }else{
		    	//没有有记录时，修改和修改密码按钮才显示
		    	$("#edit_mxlist_top").hide();			
				$("#xgmm_mxlist_top").hide();
			}
		} 
	 }).navGrid('#mxpager',{	
		edit: Boolean("${editFlag}"), 
		add:  Boolean("${editFlag}"),
		del:  false,		  
		xgmm:  Boolean("${editFlag}"),
		search:false 	 //隐藏查询功能，默认总是显示			    
	 },
	 {
		width:450,
        onclickSubmit:function(params,postdata){
        	postdata._method='PUT';  
        	params.url="orgnization/setting/ryxx/"+postdata.id;
        },
        beforeInitData: ryxxEdit,
		onInitializeForm:onInitializeFormfunc 
	 },
	 {
	    width:450,
		url:"orgnization/setting/ryxx", 
		beforeSubmit:mxaddBeforeSubmit,
		beforeInitData: ryxxEdit,
		onInitializeForm:onInitializeFormfunc 
	 }, 
	 {
		
	 });  

	 //第一个参数为jqGrid的ID,
	 //第二个参数为翻页功能条的ID
	 //第三个参数为1表示此列表不需要模糊查询，不带此参数，表示默认需要模糊查询 
	 jqGridButton("mxlist", "mxpager", 1);	

	 //自定义功能按钮-修改密码
	 $("#mxlist").jqGrid('navButtonAdd','#mxlist_toppager_left',{caption:"修改密码", title:"修改密码",id:"xgmm_mxlist_top", buttonicon:'ui-icon-document',
		 onClickButton:function(){						 	 
			 $("#pwlist").jqGrid('setSelection',$("#pwlist").getDataIDs()[0]);			 
			 $("#pwlist").editGridRow($("#pwlist").jqGrid('getGridParam','selrow'),{				  
			        width:400,				        
			        onclickSubmit:function(params,postdata){			
	  					postdata._method='PUT';		  					
   						params.url='<c:url value="/orgnization/setting/ryxx/password/"/>'+$(this).getRowData($(this).jqGrid('getGridParam','selrow'))["ryxxid"];   		
   					} 
   			 }); 
	     }
     });  
	   				 
	 $("#pwlist").jqGrid({ 
			data:[{ryxxid:'',password:'',password1:''}],
			colNames:['','用户密码', '确认密码',],
			colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell      
			         {name:'ryxxid', index:'ryxxid', hidden:true, editable:true, viewable:false},  
			         {name:'password', index:'password', editable:true,edittype:"password", editoptions:{size:24}, editrules:{required:true, custom:true, custom_func:rule_yhkl}},
			       	 {name:'password1', index:'password1', editable:true,edittype:"password", editoptions:{size:24}, editrules:{required:true, custom:true, custom_func:rule_qryhkl}},
		       	    ],		       	    
			rowNum: 1 //每页记录数     		
		}).closest(".ui-jqgrid-view").hide().closest(".ui-jqgrid").removeClass("ui-widget-content"); 	
	 
	 //主档grid定义	
	 $("#toplist").jqGrid({
			url: '<c:url value="/orgnization/setting/bmxx"/>', 
			datatype:"json",
			colNames:['','部门编号','部门名称','状态'], 
			colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell      			         
			         {name:'id', index:'id', key:true, hidden:true, editable:true}, 
			         //不用KEY:TRUE，下面prmNames中不要定义ID,用, editable:true,edittype:'custom',editoptions:{custom_element:myelem,custom_value:myval}也可以			         {name:'bmbh', index:'bmbh', width:80, align:"center",sortable:true,editable:true,editoptions:{size:10}}, 
			       	 {name:'bmmc', index:'bmmc', width:100, align:"center", sortable:true,editable:true,editoptions:{size:12},editrules:{required:true}},
			       	 {name:'used', index:'used', width:80,align:"center", sortable:false, search:false, editable:true, editoptions:{value:'true:正常;false:注销',required:true}, formatter:'select', edittype:'select'}], 
			height: topGridHeight,   
			rowNum: numOfTopRow, //每页记录数  
			pager: '#toppager', //分页标签divID    
			sortname: "bmbh",
			sortorder: "asc",            
			caption:'部门信息', //显示查询结果表格标题     
			hidegrid:false,  
			prmNames: {rows:"size", sort:"sidx", order:"sord"},  //适应controller中Pageable解析更改（spring data）
			onSelectRow:function(ids){ 
		      if(ids){ 	
		    	  //因为id 设有KEY,所以 $("#toplist").jqGrid('getGridParam','selrow')就是ID,但是如果没有勾选时，selrow为null;		
		          cur_bmxxid=ids;		            

		          //载入明细list
		          var v_url='<c:url value="/orgnization/setting/ryxx?id="/>'+ids; 
                  $("#mxlist").jqGrid('setGridParam',{url:v_url,datatype:'json'}).trigger('reloadGrid');                     
			  }
			},
			gridComplete:function(){   		
				$("#add_toplist_top").show();		
													
		        if($(this).getDataIDs().length>0){			        
		        	$("#edit_toplist_top").show(); 
		        	$("#add_mxlist_top").show();  

		        	//主表list载入后定位到第一行或者新增、修改的那一行   
		    	    if(goto_bmxxid==null) 
			    	    $(this).jqGrid('setSelection',$(this).getDataIDs()[0]);
		    	    else{
		    		    $(this).jqGrid('setSelection',goto_bmxxid);
		    		    goto_bmxxid=null;
		    	   }
		        }else{
		        	$("#edit_toplist_top").hide();
		        	$("#add_mxlist_top").hide();						
		        	$("#edit_mxlist_top").hide();			
					$("#xgmm_mxlist_top").hide();	
					//清除明细grid
					$("#mxlist").clearGridData();   	        	
		        }
			}			
		}).navGrid('#toppager',{ //根据权限显示对应的功能按钮，后面还有查询和刷新两个按钮，没有设置默认总是显示
		    edit:Boolean("${editFlag}"),
		    add:Boolean("${editFlag}"),
		    del:false
		},
		{//修改窗口相关属性  
		    width:400,
			onclickSubmit:function(params,postdata){
              postdata._method='PUT'; 
              params.url="orgnization/setting/bmxx/"+$(this).jqGrid('getGridParam','selrow');
            },
            beforeInitData: topedit,
            onInitializeForm: onInitializeFormfunc
			//,afterShowForm:editAfterShowFormFunc
		},
		{//新增窗口相关属性 
		    width:400,
			onclickSubmit:function(params,postdata){
	          postdata._method='POST'; 
	          params.url="orgnization/setting/bmxx";
	        },
	        beforeInitData: topedit
			  ,onInitializeForm: onInitializeFormfunc  			   
		},
		{//删除窗口相关属性 	
				    			 
		} 
	 ); 
	 jqGridButton("toplist","toppager",1); 

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
		 
 });	 	 
</script> 

<div id="topdiv" class="chc_top_jqgrid">
	<table id="toplist" style="width:100%"><tr><td/></tr></table>
    <div id="toppager"></div>     
</div>
<div id="tabs" class="chc_tabs">
	<ul>
		<li><a href="#tabs-1" >人员信息</a></li>					
	</ul>
    <div id="tabs-1" > 
   		<table id="mxlist" style="width:100%"><tr><td/></tr></table>  
	 	<div id="mxpager"></div>	 
	 	<table id="pwlist" style="width:100%"><tr><td></td></tr></table>	
	</div>    
	<div id="tabs-2" style="vertical-align:middle;"> 	
	</div> 	    	    
</div>  	