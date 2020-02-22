## aws-upload
- lambda를 통해 s3에 올린 이미지를 리사이징하기
    - 버킷으로부터 파일을 불러오고 저장하는 기능이 있는 index.js를 작성
    - aws-upload.zip으로 압축
        - 파일을 압축할 때 압축 파일 안에 바로 코드가 들어가야 함
        - 압축 해제했을때 aws-upload폴더가 보이면안되며, 바로 node_modules나 index.js등이 보여야함
    - sharp패키지를 사용